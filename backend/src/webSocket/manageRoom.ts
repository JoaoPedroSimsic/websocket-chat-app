import { WebSocket } from 'ws';

const rooms: Map<number, Set<WebSocket>> = new Map();

export const manageRooms = {
	joinRoom: (roomId: number, client: WebSocket) => {
		if (!rooms.has(roomId)) {
			rooms.set(roomId, new Set());
		}
		rooms.get(roomId)?.add(client);
	},

	removeClientFromRoom: (client: WebSocket) => {
		rooms.forEach((roomClients) => roomClients.delete(client));
	},
};
