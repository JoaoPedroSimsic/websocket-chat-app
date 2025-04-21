import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io';
import verifyToken from '../utils/verifyToken';

type SocketAuthMiddleware = (
	socket: Socket,
	next: (err?: ExtendedError) => void,
) => void;

const socketAuth: SocketAuthMiddleware = async (socket, next) => {
	const token = socket.handshake.auth.token;

	if (!token) {
		return next(new Error('Authentication error: Token missing'));
	}

	try {
		const user = await verifyToken(token);

		socket.userId = user.id;
		socket.userEmail = user.email;
		socket.username = user.username;

		next();
	} catch (err) {
		if (err instanceof Error) {
			if (err.message === 'Token Expired') {
				return next(new Error('Authentication error: Token expired'));
			} else if (err.message === 'Invalid Token') {
				return next(new Error('Authentication error: Invalid Token'));
			} else if (err.message === 'Invalid User') {
				return next(new Error('Authentication error: Invalid User'));
			} else {
				// Log other unexpected errors
				console.error('Socket authentication error:', err.message);
				return next(new Error('Authentication error'));
			}
		} else {
			console.error(
				'Socket authentication error: An unknown error type was thrown',
			);
			return next(new Error('Authentication error'));
		}
	}
};

export default socketAuth;
