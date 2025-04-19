import { WebSocket } from 'ws';
 import prisma from '../config/prismaClient';
 import { Message } from '@prisma/client';
 // Consider adding: import DOMPurify from 'dompurify'; // Or similar for sanitization if needed

 const handleMessage = async (
 	ws: WebSocket,
 	message: string,
 	userId: number, // Ensure this is securely associated with the connection
 	rooms: Map<number, Set<WebSocket>>,
 ) => {
 	try {
 		const { type, data } = JSON.parse(message);
 		if (type === 'newMessage') {
 			const { content, roomId } = data; // Use let for potential modification (sanitization)
 			if (!content || !roomId) {
 				ws.send(
 					JSON.stringify({
 						type: 'error',
 						message: 'Content and room are required',
 					}),
 				);
 				return;
 			}

 			// --->>> Basic Validation ADDED <<<---
 			const MAX_MESSAGE_LENGTH = 500; // Example limit
 			if (content.length > MAX_MESSAGE_LENGTH) {
 					ws.send(JSON.stringify({ type: 'error', message: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` }));
 					return;
 			}
 			// Optional Sanitization:
 			// content = DOMPurify.sanitize(content);
 			// --->>> Basic Validation END <<<---


 			// --->>> Authorization Check ADDED <<<---
 			try {
 				const roomMembership = await prisma.room.findFirst({
 					where: {
 						id: Number(roomId),
 						members: {
 							some: { id: userId },
 						},
 					},
 				});
 				if (!roomMembership) {
 					ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized: Not a member of this room' }));
 					return; // Stop processing if not a member
 				}
 			} catch (authErr) {
 					console.error('Error checking room membership:', authErr);
 					ws.send(JSON.stringify({ type: 'error', message: 'Failed to verify room membership' }));
 					return;
 			}
 			// --->>> Authorization Check END <<<---


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
 						content, // Use potentially sanitized content
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
