import { io, Socket as SocketType } from 'socket.io-client';

const Token: string =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiZW1haWwiLCJpYXQiOjE3NDUyNzM4NzgsImV4cCI6MTc0NTg3ODY3OH0.KtxTYZvfiU62eg9QDYkfFWCBd-fEGqe6GAf4WWmE0yw';

const socket: Socket = io('ws://localhost:3000', {
	auth: {
		token: Token,
	},
});

socket.on('connect', () => {
	console.log('Connected to websocket server');
	console.log('Socket ID: ', socket.id);
});

socket.on('disconnect', (reason: string) => {
	console.log('Disconnected from websocket: ', reason);
});

socket.on('connect_error', (err: Error) => {
	console.error('WebSocket connection error:', err.message);
});

// Generic listener for any incoming events (useful for debugging)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
socket.onAny((event: string, ...args: any[]) => {
	console.log(`Received event: ${event}`, args);
});

// Example of how to listen for a specific chat message event
// Define an interface for the expected message structure
interface ChatMessage {
	id: number;
	userId: number;
	username: string;
	roomId: number;
	content: string;
	timestamp: string; // Or Date, depending on how your server sends it
	sequence: number;
	createdAt: string; // Or Date
}

socket.on('chat:message', (message: ChatMessage) => {
	console.log('New chat message:', message);
});

// You can also add listeners for error events you might emit from the server
socket.on('error:room:join', (errorMessage: string) => {
	console.error('Error joining room:', errorMessage);
});

socket.on('error:chat:message', (errorMessage: string) => {
	console.error('Error sending message:', errorMessage);
});
