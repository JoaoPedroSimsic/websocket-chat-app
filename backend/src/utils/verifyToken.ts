import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient';
import { User } from '@prisma/client';

interface DecodedToken {
	userId: number;
	email: string;
	iat: number;
	exp: number;
}

const verifyToken = async (token: string): Promise<User> => {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw new Error('JWT_SECRET not set');
	}

	try {
		const decoded = jwt.verify(token, secret) as DecodedToken;
		const { userId, email } = decoded;

		const user = await prisma.user.findUnique({ where: { id: userId, email } });

		if (!user) {
			throw new Error('Invalid User');
		}

		return user;
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			throw new Error('Token Expired');
		} else if (err instanceof jwt.JsonWebTokenError) {
			throw new Error('Invalid Token');
		}

		throw new Error('Authentication failed');
	}
};

export default verifyToken;
