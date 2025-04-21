import prisma from '../config/prismaClient';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

class UserService {
	public async getAllUsers(): Promise<User[]> {
		return prisma.user.findMany();
	}

	public async getUserById(userId: number): Promise<User | null> {
		return prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
	}

	public async getUserByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	public async createUser(
		username: string,
		email: string,
		password: string,
	): Promise<User> {
		const hashedPassword = await bcrypt.hash(password, 10);
		return prisma.user.create({
			data: { username, email, password: hashedPassword },
		});
	}

	public async updateUser(
		userId: number,
		data: { username?: string; email?: string; password?: string },
	): Promise<User> {

		if (data.password) {
			data.password = await bcrypt.hash(data.password, 10);
		}

		return prisma.user.update({
			where: { id: userId },
			data
		});
	}

	public async deleteUser(userId: number): Promise<void> {
		await prisma.user.delete({
			where: { id: userId },
		});
	}
}

export default new UserService();
