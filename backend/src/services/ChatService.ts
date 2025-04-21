import prisma from '../config/prismaClient';
import { Message, Room } from '@prisma/client';
import { Server } from 'socket.io';

type MessageWithSender = Message & { sender: { username: string } };

class ChatService {
	private io: Server | undefined;

	constructor(ioInstance?: Server) {
		if (ioInstance) {
			this.io = ioInstance;
		}
	}

	public async saveMessage(
		senderId: number,
		roomId: number,
		content: string,
	): Promise<MessageWithSender> {
		try {
			const newMessage = await prisma.message.create({
				data: {
					senderId: senderId,
					roomId: roomId,
					content: content,
				},
				include: {
					sender: {
						select: { username: true },
					},
				},
			});

			return newMessage as MessageWithSender;
		} catch (err) {
			console.log('Error saving message: ', err);
			throw new Error('Failed to save message');
		}
	}

	public async getMessagesInRoom(
		roomId: number,
		limit = 50,
		offset = 0,
	): Promise<MessageWithSender[]> {
		try {
			const messages = await prisma.message.findMany({
				where: { roomId: roomId },
				orderBy: {
					timestamp: 'asc',
				},
				include: {
					sender: {
						select: { username: true },
					},
				},
				take: limit,
				skip: offset,
			});

			return messages as MessageWithSender[];
		} catch (err) {
			console.log('Error fetching messages: ', err);
			throw new Error('Failed to fetch messages');
		}
	}

	public broadcastMessage(roomId: string, message: MessageWithSender): void {
		if (!this.io) {
			console.log(
				'Socket.IO instance not available in ChatService for broadcasting',
			);
			return;
		}

		this.io.to(roomId).emit('chat:message', {
			id: message.id,
			userId: message.senderId,
			username: message.sender.username,
			roomId: message.roomId,
			content: message.content,
			timestamp: message.timestamp,
			sequence: message.sequence,
			createdAt: message.createdAt,
		});
	}

	public async createRoom(
		name: string,
		initialMemberIds: number[],
	): Promise<Room> {
		try {
			const newRoom = await prisma.room.create({
				data: {
					name: name,
					members: {
						connect: initialMemberIds.map((id) => ({ id })),
					},
				},
				include: {
					members: {
						select: { id: true, username: true },
					},
				},
			});

			return newRoom;
		} catch (err) {
			console.log('Error creating room: ', err);
			throw new Error('Failed to create room');
		}
	}

	public async addUserToRoom(roomId: number, userId: number): Promise<void> {
		try {
			await prisma.room.update({
				where: { id: roomId },
				data: {
					members: {
						connect: { id: userId },
					},
				},
			});
		} catch (err) {
			console.log('Error adding user to room: ', err);
			throw new Error('Failed to add user to room');
		}
	}

	public async removeUserFromRoom(roomId: number, userId: number): Promise<void> {
		try {
			await prisma.room.update({
				where: { id: roomId },
				data: {
					members: {
						disconnect: { id: userId }
					}
				}
			})
		} catch (err) {
			console.log('Error removing user from room: ', err);
			throw new Error('Failed to remove user from room');
		}
	}
}

export default ChatService;
