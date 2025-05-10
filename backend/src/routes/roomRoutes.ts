import { Router } from 'express';
import RoomController from '../controllers/roomController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, RoomController.createRoom);
router.get('/', authMiddleware, RoomController.getAllRooms);
router.get('/:id', authMiddleware, RoomController.getRoomById);
router.delete('/:id', authMiddleware, RoomController.deleteRoom);

router.post('/:id/join', authMiddleware, RoomController.addUserToRoom);
router.delete(
	'/:id/:removeId',
	authMiddleware,
	RoomController.removeUserFromRoom,
);

export default router;
