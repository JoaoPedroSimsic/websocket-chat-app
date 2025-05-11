import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes';
import loginRoutes from './routes/loginRoutes';
import roomRoutes from './routes/roomRoutes';

class App {
	public app: express.Application;

	constructor() {
		this.app = express();
		this.middlewares();
		this.routes();
	}

	private middlewares(): void {
		this.app.use(
			cors({
				origin: 'http://localhost:5173',
				credentials: true,
			}),
		);
		this.app.use(express.json());
		this.app.use(cookieParser());
	}

	private routes(): void {
		this.app.use('/login', loginRoutes);
		this.app.use('/users', userRoutes);
		this.app.use('/rooms', roomRoutes);
	}
}

export default new App().app;
