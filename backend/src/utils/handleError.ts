import { Response } from 'express';

export default function handleError(err: unknown, res: Response, message: string): void {
	if (err instanceof Error) {
		res.status(500).json({ message, error: err.message });
	} else {
		res.status(500).json({ message, error: 'unknown error' });
	}

}

