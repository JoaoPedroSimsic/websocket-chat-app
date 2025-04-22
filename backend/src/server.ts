import app from './app';
import http from 'http';
import 'dotenv/config';
import { Server } from 'socket.io';
import socketAuth from './middlewares/authSocket';
import registerHandleChat from './webSocket/handleChat';

const PORT = process.env.PORT;

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		//config cors in the future
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

io.use(socketAuth);

registerHandleChat(io);

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

export { io };
