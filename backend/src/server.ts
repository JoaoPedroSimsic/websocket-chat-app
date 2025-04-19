import app from './app';
import http from 'http';
import 'dotenv/config';
import { initializeWebSocketServer } from './webSocket/webSocketServer';

const PORT = process.env.PORT;

const server = http.createServer(app);

initializeWebSocketServer(server);

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
})
