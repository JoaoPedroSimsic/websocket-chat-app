import { Router } from 'express';
import TokenController from '../controllers/tokenController';

const router = Router();

router.post('/', TokenController.generateToken);

export default router;
