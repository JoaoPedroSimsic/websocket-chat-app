import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import prisma from '../config/prismaClient';
import isValidPassword from '../utils/isValidPassword';
import handleError from '../utils/handleError';

class AuthController {
	public async login(req: Request, res: Response): Promise<void> {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				res.status(401).json({ errors: ['Invalid credentials'] });
				return;
			}

			const user = await prisma.user.findUnique({ where: { email } });

			if (!user) {
				res.status(404).json({ errors: ['User not found'] });
				return;
			}

			if (!(await isValidPassword(password, user.password))) {
				res.status(401).json({ errors: ['Invalid password'] });
				return;
			}

			if (!process.env.JWT_SECRET) {
				throw new Error('JWT_SECRET not set');
			}

			const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
				expiresIn: '7d',
			});

			res.cookie('authToken', token, {
				httpOnly: true,
				// I should set it true in production
				secure: false,
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000,
				path: '/',
			});

			res.status(200).json({ token, username: user.username, id: user.id });
		} catch (err) {
			handleError(err, res, 'Error setting up auth Token');
		}
	}

	public logout(_req: Request, res: Response): void {
		res.cookie('authToken', '', {
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			expires: new Date(0),
			path: '/',
		});

		res.status(200).json({ message: 'Logout successfully' });
	}
}

export default new AuthController();
