import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import verifyToken from '../utils/verifyToken';

import handleError from '../utils/handleError';

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

	const token = authorization.split(' ')[1];

	if (!token) {
		res.status(401).json({ error: 'Invalid token format' });
	}

	try {
		const user = await verifyToken(token);

		req.userId = user.id;
		req.userEmail = user.email;
		next();
	} catch (err) {
		if (err instanceof Error) {
			if (err.message === 'Token Expired') {
				res.status(401).json({ error: 'Token Expired' });
			} else if (err.message === 'Invalid Token') {
				res.status(401).json({ error: 'Invalid Token' });
			} else if (err.message === 'Invalid User') {
				res.status(401).json({ error: 'Invalid User' });
			}
			handleError(err, res, 'Authentication Error');
		} else {
			handleError(new Error('An unknown authentication error occuried'), res, 'Authentication Error')
		}
	}
};

export default authMiddleware;
