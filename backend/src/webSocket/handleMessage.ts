import { WebSocket } from 'ws';
import prisma from '../config/prismaClient';
import { Message } from '@prisma/client';

const handleMessage = async (
	ws: WebSocket,
	message: string,
	userId: number,
	rooms: Map<number, Set<WebSocket>>,
) => {
	try {
		const { type, data } = JSON.parse(message);

		if (type === 'newMessage') {
			const { content, roomId } = data;

			if (!content || !roomId) {
				ws.send(
					JSON.stringify({
						type: 'error',
						message: 'Content and room are required',
					}),
				);
				return;
			}

			let nextSequence = 0;
			try {
				const maxSequence = await prisma.message.aggregate({
					_max: { sequence: true },
					where: { roomId: Number(roomId) },
				});

				nextSequence = (maxSequence._max?.sequence || 0) + 1;
			} catch (err) {
				console.log('error getting max sequence', err);
				ws.send(
					JSON.stringify({
						type: 'error',
						message: 'failed to generate sequence number',
					}),
				);
				return;
			}

			let newMessage: Message;
			try {
				newMessage = await prisma.message.create({
					data: {
						content,
						roomId: Number(roomId),
						senderId: userId,
						sequence: nextSequence,
					},
				});
		} catch (err) {
				console.log('error saving message', err);
				ws.send(
					JSON.stringify({ type: 'error', message: 'failed to save message' }),
				);
				return;
			}

			const roomClients = rooms.get(Number(roomId));
			if (roomClients) {
				roomClients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								type: 'newMessage',
								message: { ...newMessage, senderId: userId },
							}),
						);
					}
				});
			}
		}
	} catch (err) {
		console.log('websocket message error: ', err);
		ws.send(
			JSON.stringify({ type: 'error', message: 'invalid message format' }),
		);
	}
};

export default handleMessage;
