import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient';

import handleError from '../utils/handleError';

const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const authorization = req.headers.authorization;

	if (!authorization) {
		res.status(401).json({ error: 'Login Required' });
		return;
	}

	const [, token] = authorization.split(' ');

	if (!token) {
		res.status(401).json({ error: 'Invalid token format' });
	}

	try {
		if (!jwtSecret) {
			throw new Error('JWT_SECRET not set');
		}
		const decoded = jwt.verify(token, jwtSecret) as {
			id: number;
			email: string;
		};
		const { id, email } = decoded;

		const user = await prisma.user.findUnique({ where: { id, email } });

		if (!user || user.email !== email) {
			res.status(401).json({ error: 'Invalid User' });
			return;
		}

		req.userId = id;
		req.userEmail = email;
		next();
	} catch (err) {
		handleError(err, res, 'error');
		return;
	}
};

export default authMiddleware;
