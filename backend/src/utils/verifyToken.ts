import jwt from 'jsonwebtoken';
const verifyToken = (
	token: string | undefined,
	secret: string | undefined,
): Promise<number | null> => {
	return new Promise((resolve) => {
		if (!token || !secret) {
			resolve(null);
			return;
		}

		try {
			const decoded = jwt.verify(token, secret) as { userId: number };
			resolve(decoded.userId);
		} catch (err) {
			console.log('token verification error', err);
			resolve(null);
		}
	});
};

export default verifyToken;
