import prisma from '../config/prismaClient';
import { Room, Message } from '@prisma/client';

type RoomWithMembersAndMessages = Room & {
	members: { username: string }[];
	messages: (Message & { sender: { username: string } })[];
};

class RoomService {
	public async createRoom(name: string): Promise<Room> {
		try {
			const room = await prisma.room.create({
				data: {
					name,
				},
			});
			return room;
		} catch (err) {
			console.log('Error creating room: ', err);
			throw new Error('Could not create room');
		}
	}

	public async deleteRoom(roomId: number): Promise<Room> {
		try {
			const room = await prisma.room.delete({
				where: { id: roomId },
			})
			return room;
		} catch (err) {
			console.log('Error deleting room: ', err);
			throw new Error('Could not delete room');
		}
	}

	public async getAllRooms(): Promise<
		(Room & { _count: { members: number } })[]
	> {
		try {
			const rooms = await prisma.room.findMany({
				include: {
					_count: {
						select: {
							members: true,
						},
					},
				},
			});
			return rooms;
		} catch (err) {
			console.log('Error fetching room: ', err);
			throw new Error('Could not retrieve room');
		}
	}

	public async getRoomById(
		roomId: number,
	): Promise<RoomWithMembersAndMessages | null> {
		try {
			const room = await prisma.room.findUnique({
				where: {
					id: roomId,
				},
				include: {
					members: {
						select: {
							username: true, 
						},
					},
					messages: {
						orderBy: {
							createdAt: 'asc', 
						},
						include: {
							sender: {
								select: {
									username: true, 
								},
							},
						},
					},
				},
			});
			return room;
		} catch (err) {
			console.log(`Error fetching room with ID ${roomId}: `, err);
			throw new Error('Could not retrieve room');
		}
	}

	public async addUserToRoom(roomId: number, userId: number): Promise<Room> {
		try {
			const room = await prisma.room.update({
				where: { id: roomId },
				data: {
					members: {
						connect: { id: userId },
					},
				},
			});
			return room;
		} catch (err) {
			console.log(`Error adding user ${userId} to room ${roomId}: `, err);
			throw new Error('Could not add user to room');
		}
	}

	public async removeUserFromRoom(
		roomId: number,
		userId: number,
	): Promise<Room> {
		try {
			const room = prisma.room.update({
				where: { id: roomId },
				data: {
					members: {
						disconnect: { id: userId },
					},
				},
			});
			return room;
		} catch (err) {
			console.log(`Error removing user ${userId} to room ${roomId}: `, err);
			throw new Error('Could not remove user from room');
		}
	}
}

export default new RoomService();
