import app from './app';
import http from 'http';
import 'dotenv/config';

const PORT = process.env.PORT;

const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
})
