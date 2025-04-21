import { Server, Socket } from 'socket.io';
import ChatService from '../services/ChatService';

const registerHandleChat = (io: Server) => {
// 	io.on('connection', (socket: Socket) => {
// 		console.log(`User connected: ${socket.id}`);
//
// 		socket.on('room:join', async (roomId: string) => {
// 			try {
// 				await socket.join(roomId);
// 				console.log(`User ${socket.id} joined room: ${roomId}`);
//
// 				const messages = await ChatService.getMessagesInRoom(Number(roomId));
// 				socket.emit('chat:history', messages);
// 			} catch (err) {
// 				console.log(`Error joining room ${roomId}`, err);
// 				socket.emit('error:room:join', 'Failed to join room');
// 			}
// 		});
//
// 		socket.on(
// 			'chat:message',
// 			async (message: { roomId: string; content: string }) => {
// 				if (!socket.userId || !socket.username) {
// 					socket.emit(
// 						'error:chat:message',
// 						'Authentication required to send messages',
// 					);
// 					return;
// 				}
//
// 				try {
// 					const savedMessage = await ChatService.saveMessage(
// 						Number(socket.userId),
// 						Number(message.roomId),
// 						message.content,
// 					);
// 					ChatService.broadcastMessage(message.roomId, savedMessage);
// 					console.log(
// 						`Message sent to room ${message.roomId} by ${socket.username}: ${message.content}`,
// 					);
// 				} catch (err) {
// 					console.log('Error saving or broadcasting message', err);
// 					socket.emit('error:chat:message', 'Failed to send message');
// 				}
// 			},
// 		);
//
// 		socket.on('room:leave', async (roomId: string) => {
// 			try {
// 				await socket.leave(roomId);
// 				console.log(`User ${socket.username} left room: ${roomId}`);
// 			} catch (err) {
// 				console.log(`Error leaving room ${roomId}`, err);
// 				socket.emit('error:room:leave', 'Failed to leave room');
// 			}
// 		});
//
// 		socket.on('disconnect', () => {
// 			console.log(`User disconnected: ${socket.id}`);
// 		});
// 	});
};

export default registerHandleChat;
