import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient';

import handleError from '../utils/handleError';

const authMiddleware = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const jwtSecret = process.env.JWT_SECRET;

	const authorization = req.headers.authorization;

	if (!authorization) {
		res.status(401).json({ error: 'Login Required' });
		return;
	}

	const token = authorization.split(' ')[1];

	if (!token) {
		res.status(401).json({ error: 'Invalid token format' });
	}

	try {
		if (!jwtSecret) {
			throw new Error('JWT_SECRET not set');
		}
		const decoded = jwt.verify(token, jwtSecret) as {
			userId: number;
			email: string;
		};

		const { userId, email } = decoded;

		const user = await prisma.user.findUnique({ where: { id: userId, email } });

		if (!user || user.email !== email) {
			res.status(401).json({ error: 'Invalid User' });
			return;
		}

		req.userId = userId;
		req.userEmail = email;
		next();
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			res.status(401).json({ error: 'Token Expired' });
		} else if (err instanceof jwt.JsonWebTokenError) {
			res.status(401).json({ error: 'Invalid Token' });
		}
		handleError(err, res, 'Authentication Error');
	}
};

export default authMiddleware;
