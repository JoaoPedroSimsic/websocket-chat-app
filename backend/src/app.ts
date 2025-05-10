import express from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoutes';
import tokenRoutes from './routes/tokenRoutes';
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
	}

	private routes(): void {
		this.app.use('/users', userRoutes);
		this.app.use('/token', tokenRoutes);
		this.app.use('/rooms', roomRoutes);
	}
}

export default new App().app;
