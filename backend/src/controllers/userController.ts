import { Request, Response } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import { User } from '@prisma/client';
import prisma from '../config/prismaClient';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import handleError from '../utils/handleError';
import isValidPassword from '../utils/isValidPassword';

class UserController {
	public async getAllUsers(_req: Request, res: Response): Promise<void> {
		try {
			const users = await prisma.user.findMany();
			res.status(200).json(users);
		} catch (err) {
			handleError(err, res, 'Error fetching users');
		}
	}

	public async getUserById(req: AuthRequest, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.id);

			if (!userId || isNaN(Number(userId))) {
				res.status(400).json({ message: 'Invalid user ID' });
				return;
			}

			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
			});

			if (!user) {
				res.status(404).json({ message: 'User not found' });
				return;
			}

			res.status(200).json(user);
		} catch (err) {
			handleError(err, res, 'Error fetching user');
		}
	}

	public async createUser(req: Request, res: Response): Promise<void> {
		try {
			const { username, email, password } = req.body;

			const existingUser = await prisma.user.findUnique({ where: { email } });

			if (existingUser) {
				res.status(400).json({ message: 'Email already in use' });
				return;
			}

			if (!validator.isEmail(email)) {
				res.status(400).json({ message: 'Invalid email' });
				return;
			}

			if (!username || !password) {
				res.status(400).json({ message: 'Username and password are required' });
				return;
			}

			if (password.length < 3) {
				res
					.status(400)
					.json({ message: 'Password must be at least 3 characters' });
				return;
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const newUser: User = await prisma.user.create({
				data: { username, email, password: hashedPassword },
			});

			res
				.status(201)
				.json({ message: 'User created successfully', user: newUser });
		} catch (err: unknown) {
			handleError(err, res, 'Error creating user');
		}
	}

	public async updateUser(req: AuthRequest, res: Response): Promise<void> {
		
		type UpdateUserData = {
			username?: string;
			email?: string;
			password?: string;
		}

		try {
			const { userId } = req;
			const { id } = req.params;
			const { username, email, password } = req.body;

			if (!userId) {
				res.status(401).json({ error: 'Unauthorized' });
				return;
			}

			if (Number(id) !== userId) {
				res.status(403).json({ error: 'You can only update your own account' });
				return;
			}

			const data: UpdateUserData = { username, email, password }; 

			if (password) {
				data.password = await bcrypt.hash(password, 10);
			}

			const cleanedData = Object.fromEntries(
				Object.entries(data).filter(([_, value]) => value !== undefined)
			)

			const updatedUser = await prisma.user.update({
				where: { id: Number(id) },
				data: cleanedData,	
			});

			res
				.status(200)
				.json({ message: 'User updated successfully', updatedUser });
		} catch (err) {
			handleError(err, res, 'Error updating user');
		}
	}

	public async deleteUser(req: AuthRequest, res: Response): Promise<void> {
		try {
			const { userId } = req;
			const { id } = req.params;
			const { password } = req.body;

			if (!userId) {
				res.status(401).json({ error: 'Unauthorized' });
				return;
			}

			if (Number(id) !== userId) {
				res.status(403).json({ error: 'You can only delete your own account' });
				return;
			}

			const user = await prisma.user.findUnique({
				where: { id: Number(id) },
			});

			if (!user) {
				res.status(404).json({ message: 'User not found' });
				return;
			}

			if (!(await isValidPassword(password, user.password))) {
				res.status(401).json({ message: 'Invalid password' });
				return;
			}

			await prisma.user.delete({
				where: { id: Number(id) },
			});

			res.status(200).json({ message: 'User deleted successfully' });
		} catch (err) {
			handleError(err, res, 'Error deleting user');
		}
	}
}

export default new UserController();
