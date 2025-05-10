import { Response } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import RoomService from '../services/RoomService';

import handleError from '../utils/handleError';

class RoomController {
	public async createRoom(req: AuthRequest, res: Response): Promise<void> {
		const { name } = req.body;

		if (!name) {
			res.status(400).json({ error: 'Room name required' });
			return;
		}

		try {
			const room = await RoomService.createRoom(name);
			res.status(201).json(room);
		} catch (err) {
			handleError(err, res, 'Failed to create room');
		}
	}

	public async deleteRoom(req: AuthRequest, res: Response): Promise<void> {
		const { id } = req.params;
		const roomId = Number(id);

		if (isNaN(roomId)) {
			res.status(400).json({ error: 'Missing or invalid ID' });
			return;
		}

		try {
			const room = await RoomService.deleteRoom(roomId);
			res.status(200).json({ message: 'Room deleted', room });
		} catch (err) {
			handleError(err, res, 'Failed to delete room');
		}
	}

	public async getAllRooms(req: AuthRequest, res: Response): Promise<void> {
		try {
			const rooms = await RoomService.getAllRooms();
			res.status(200).json(rooms);
		} catch (err) {
			handleError(err, res, 'Failed to retrieve rooms');
		}
	}

	public async getRoomById(req: AuthRequest, res: Response): Promise<void> {
		const { id } = req.params;
		const roomId = Number(id);

		if (isNaN(roomId)) {
			res.status(400).json({ error: 'Invalid room ID' });
			return;
		}

		try {
			const room = await RoomService.getRoomById(roomId);

			if (room) {
				res.status(200).json(room);
			} else {
				res.status(404).json({ error: 'Room not found' });
			}
		} catch (err) {
			handleError(err, res, 'Failed to retrieve room');
		}
	}

	public async addUserToRoom(req: AuthRequest, res: Response): Promise<void> {
		const { id } = req.params;
		const roomId = Number(id);
		const { userId } = req;

		if (isNaN(roomId) || !userId) {
			res
				.status(400)
				.json({ error: 'Invalid room ID or user is not authorized' });
			return;
		}

		try {
			const room = RoomService.addUserToRoom(roomId, userId);
			res.status(200).json({ message: 'User added to room ', room });
		} catch (err) {
			handleError(err, res, 'Failed to add user to room');
		}
	}

	public async removeUserFromRoom(
		req: AuthRequest,
		res: Response,
	): Promise<void> {
		const { id, removeId } = req.params;
		const userIdToRemove = Number(removeId);
		const roomId = Number(id);
		const { userId } = req;

		if (isNaN(roomId) || !userId || !removeId) {
			res
				.status(400)
				.json({ error: 'Invalid room ID, user ID or not authorized' });
			return;
		}

		try {
			const room = await RoomService.removeUserFromRoom(roomId, userIdToRemove);
			res.status(200).json({ message: 'User remove from room ', room });
		} catch (err) {
			handleError(err, res, 'Failed to remove user from room');
		}
	}
}

export default new RoomController();
