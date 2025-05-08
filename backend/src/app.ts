import express from 'express';
import userRoutes from './routes/userRoutes';
import tokenRoutes from './routes/tokenRoutes';
import roomRoutes from './routes/roomRoutes';
import path from 'path';

class App {
	public app: express.Application;

	constructor() {
		this.app = express();
		this.middlewares();
		this.routes();
		this.serveFrontend();
	}

	private middlewares(): void {
		this.app.use(express.json());
	}

	private routes(): void {
		this.app.use('/users', userRoutes);
		this.app.use('/token', tokenRoutes);
		this.app.use('/rooms', roomRoutes);
	}

	private serveFrontend(): void {
		// Serve static files from the 'frontend' directory
		// This makes files like index.html, CSS files, etc., available
		this.app.use(express.static(path.join(__dirname, '../../frontend')));

		// Serve the index.html file specifically for the root route '/'
		this.app.get('/', (_req, res) => {
			res.sendFile(path.join(__dirname, '../../frontend/index.html'));
		});
	}
}

export default new App().app;
