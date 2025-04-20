import { Router } from 'express';
import UserController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware' 

const router = Router();

router.get('/', UserController.getAllUsers);
router.get('/:id', authMiddleware, UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', authMiddleware,  UserController.updateUser);
router.delete('/:id', authMiddleware,  UserController.deleteUser);

export default router;
