import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/AuthRequest';

export function skipAuth(req: Request, _res: Response, next: NextFunction) {
	(req as AuthRequest).skipAuth = true;
	next();
}
