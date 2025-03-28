import bcrypt from 'bcryptjs';

export default function isValidPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(plainPassword, hashedPassword);
}
