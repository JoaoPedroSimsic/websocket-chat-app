import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import prisma from '../config/prismaClient';

import verifyToken from '../utils/verifyToken';
import handleError from '../utils/handleError';

const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		res.status(401).json({ error: 'Login Required' });
		return;
	}

	const token = authHeader.split(' ')[1];

	const userId = await verifyToken(token, jwtSecret);

	if (userId === null) {
		res.status(401).json({ error: 'Invalid token' });
		return;
	}

	try {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			res.status(401).json({ error: 'Invalid user' });
			return;
		}

		req.userId = userId;
		req.userEmail = user.email;
		next();
	} catch (err) {
		handleError(err, res, 'Authentication Error');
	}
};

export default authMiddleware;
