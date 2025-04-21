import { Request, Response } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import UserService from '../services/UserService';
import validator from 'validator';
import handleError from '../utils/handleError';
import isValidPassword from '../utils/isValidPassword';

class UserController {
	public async getAllUsers(_req: Request, res: Response): Promise<void> {
		try {
			const users = await UserService.getAllUsers();
			res.status(200).json(users);
		} catch (err) {
			handleError(err, res, 'Error fetching users');
		}
	}

	public async getUserById(req: AuthRequest, res: Response): Promise<void> {
		try {
			const userId = Number(req.params.id);

			if (!userId || isNaN(Number(userId))) {
				res.status(400).json({ error: 'Invalid user ID' });
				return;
			}

			const user = await UserService.getUserById(userId);

			if (!user) {
				res.status(404).json({ error: 'User not found' });
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

			const existingUser = await UserService.getUserByEmail(email);

			if (existingUser) {
				res.status(400).json({ error: 'Email already in use' });
				return;
			}

			if (!validator.isEmail(email)) {
				res.status(400).json({ error: 'Invalid email' });
				return;
			}

			if (!username || !password) {
				res.status(400).json({ error: 'Username and password are required' });
				return;
			}

			if (password.length < 3) {
				res
					.status(400)
					.json({ error: 'Password must be at least 3 characters' });
				return;
			}

			const newUser = await UserService.createUser(username, email, password);

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
		};

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

			if (email && !validator.isEmail(email)) {
				res.status(403).json({ error: 'Invalid email' });
				return;
			}

			if (password && password.length < 3) {
				res
					.status(403)
					.json({ error: 'Password must be at least 3 characters' });
				return;
			}

			const data: UpdateUserData = { username, email, password };

			const cleanedData = Object.fromEntries(
				Object.entries(data).filter(([_, value]) => value !== undefined),
			);

			const updatedUser = await UserService.updateUser(Number(id), cleanedData);

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

			const user = await UserService.getUserById(Number(id));

			if (!user) {
				res.status(404).json({ error: 'User not found' });
				return;
			}

			if (!(await isValidPassword(password, user.password))) {
				res.status(401).json({ error: 'Invalid password' });
				return;
			}

			await UserService.deleteUser(Number(id));

			res.status(200).json({ message: 'User deleted successfully' });
		} catch (err) {
			handleError(err, res, 'Error deleting user');
		}
	}
}

export default new UserController();
