import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient';
import isValidPassword from '../utils/isValidPassword';
import handleError from '../utils/handleError';

class TokenController {
	public async generateToken(req: Request, res: Response): Promise<void> {
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

			if (!await isValidPassword(password, user.password)) {
				res.status(401).json({ errors: ['Invalid password'] });
				return;
			}

			if (!process.env.JWT_SECRET) {
				throw new Error('JWT_SECRET not set');
			}

			const token = jwt.sign(
				{ userId: user.id, email: user.email },
				process.env.JWT_SECRET,
				{ expiresIn: '7d' },
			);

			console.log('Token Payload', { userId: user.id, email: user.email });

			res.status(200).json({ token, username: user.username, id: user.id });
		} catch (err) {
			handleError(err, res, 'Error generating token');
		}
	}
}

export default new TokenController();
