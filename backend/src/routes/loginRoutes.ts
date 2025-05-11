import { Router } from 'express';
import LoginController from '../controllers/loginController';

const router = Router();

router.get('/', LoginController.login);

export default router;
