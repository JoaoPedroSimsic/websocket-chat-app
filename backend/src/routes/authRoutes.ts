import { Router } from 'express';
import AuthController from '../controllers/authController';

const router = Router();

router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);

export default router;
