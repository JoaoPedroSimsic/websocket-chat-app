import { Router } from 'express';
import TokenController from '../controllers/tokenController';

const router = Router();

router.get('/', TokenController.generateToken);

export default router;
