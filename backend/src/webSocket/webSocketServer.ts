import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import url from 'url';
import verifyToken from '../utils/verifyToken'; // Utility to verify JWT
import handleMessage from './handleMessage'; // Your existing message handler
import { manageRooms } from './manageRoom'; // Your room management utility

// Extend WebSocket interface to hold userId
interface AuthenticatedWebSocket extends WebSocket {
	userId?: number;
}

const rooms: Map<number, Set<AuthenticatedWebSocket>> = new Map(); // Store room memberships

export function initializeWebSocketServer(server: http.Server) {
	const wss = new WebSocketServer({ server }); // Attach WebSocket server to the HTTP server

	console.log('WebSocket server initialized');

	wss.on(
		'connection',
		async (ws: AuthenticatedWebSocket, req: http.IncomingMessage) => {
			console.log('Client attempting to connect...');

			// 1. Authenticate Connection using JWT from query parameter
			const parameters = url.parse(req.url || '', true).query;
			const token = parameters.token as string | undefined;
			const jwtSecret = process.env.JWT_SECRET;

			if (!token || !jwtSecret) {
				console.log('Authentication failed: Token or JWT_SECRET missing.');
				ws.close(1008, 'Authentication token required'); // 1008: Policy Violation
				return;
			}

			const userId = await verifyToken(token, jwtSecret);

			if (userId === null) {
				console.log('Authentication failed: Invalid token.');
				ws.close(1008, 'Invalid authentication token');
				return;
			}

			// Authentication successful
			ws.userId = userId; // Associate userId with the WebSocket connection
			console.log(`Client connected successfully with userId: ${userId}`);
			ws.send(JSON.stringify({ type: 'connection_ack', userId })); // Acknowledge successful connection

			// 2. Handle Messages from Authenticated Client
			ws.on('message', (message: Buffer | string) => {
				const messageString = message.toString();
				console.log(
					`Received message from userId ${ws.userId}: ${messageString}`,
				);

				if (!ws.userId) {
					console.error(
						'Received message from unauthenticated WebSocket. Closing connection.',
					);
					ws.close(1008, 'Connection not authenticated');
					return;
				}

				try {
					const parsedMessage = JSON.parse(messageString);

					// Handle different message types (e.g., joining rooms, sending messages)
					switch (parsedMessage.type) {
						case 'joinRoom': {
							const roomIdToJoin = Number(parsedMessage.data?.roomId);
							if (!isNaN(roomIdToJoin)) {
								manageRooms.joinRoom(roomIdToJoin, ws);
								console.log(`UserId ${ws.userId} joined room ${roomIdToJoin}`);
								// Optionally send confirmation back to client
								ws.send(
									JSON.stringify({ type: 'joinedRoom', roomId: roomIdToJoin }),
								);
								// Optionally fetch and send recent messages for the room here
							} else {
								ws.send(
									JSON.stringify({
										type: 'error',
										message: 'Invalid room ID for joining.',
									}),
								);
							}
							break;
						}

						case 'newMessage': // Pass chat messages to the existing handler
							// Pass the rooms map to handleMessage if needed, or manage it internally
							handleMessage(ws, messageString, ws.userId, rooms); // Use the 'rooms' map from this scope or adjust handleMessage
							break;

						// Add other message type handlers as needed (e.g., 'leaveRoom')

						default:
							console.log(
								`Received unknown message type: ${parsedMessage.type}`,
							);
							ws.send(
								JSON.stringify({
									type: 'error',
									message: `Unknown message type: ${parsedMessage.type}`,
								}),
							);
					}
				} catch (error) {
					console.error(
						`Failed to parse message or invalid message format from userId ${ws.userId}:`,
						error,
					);
					ws.send(
						JSON.stringify({
							type: 'error',
							message: 'Invalid message format',
						}),
					);
				}
			});

			// 3. Handle Client Disconnection
			ws.on('close', () => {
				console.log(`Client disconnected: userId ${ws.userId ?? 'unknown'}`);
				// Remove client from all rooms they might have joined
				manageRooms.removeClientFromRoom(ws);
			});

			// 4. Handle Errors
			ws.on('error', (error) => {
				console.error(
					`WebSocket error for userId ${ws.userId ?? 'unknown'}:`,
					error,
				);
				// Clean up resources if necessary
				manageRooms.removeClientFromRoom(ws);
			});
		},
	);
}

// Note: Ensure manageRooms.ts exports 'rooms' if handleMessage needs direct access,
// or pass the 'rooms' map defined here into handleMessage if its signature allows.
// The current call passes the 'rooms' map from this file's scope:
// handleMessage(ws, messageString, ws.userId, rooms);
// You might need to adjust the 'handleMessage' function signature or logic
// depending on how you want to manage the 'rooms' state.
// The manageRoom.ts provided earlier encapsulates its own 'rooms' map.
// Decide whether to use the encapsulated one or pass this one.
// Using the encapsulated one from manageRoom.ts is generally cleaner.
// If using the encapsulated one, you might not need to pass `rooms` to `handleMessage`.

// --- Adjustments potentially needed in manageRoom.ts ---
/*
If you want handleMessage to use the rooms map from manageRoom.ts,
ensure manageRoom.ts exports it or provides a way to broadcast to rooms. Example:

// In manageRoom.ts
export const rooms: Map<number, Set<WebSocket>> = new Map(); // Export if needed directly

export const manageRooms = {
		// ... joinRoom, removeClientFromRoom ...

		// Add a function to broadcast
		broadcastToRoom: (roomId: number, message: string, senderWs: WebSocket) => {
				const roomClients = rooms.get(roomId);
				if (roomClients) {
						roomClients.forEach((client) => {
								// Optionally avoid sending back to the sender: if (client !== senderWs)
								if (client.readyState === WebSocket.OPEN) {
										client.send(message);
								}
						});
				}
		}
};

// Then in handleMessage.ts, you would import and use manageRooms.broadcastToRoom
// instead of directly iterating over a passed-in 'rooms' map.
*/
