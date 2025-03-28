import express from 'express';
import userRoutes from './routes/userRoutes';
import tokenRoutes from './routes/tokenRoutes';

class App {
	public app: express.Application;

	constructor() {
		this.app = express();
		this.middlewares();
		this.routes();
	}

	private middlewares(): void {
		this.app.use(express.json());
	}

	private routes(): void {
		this.app.use('/users', userRoutes);
		this.app.use('/token', tokenRoutes);
	}
}

export default new App().app;
