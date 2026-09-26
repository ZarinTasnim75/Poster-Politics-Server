import { Router } from 'express';
import {
  createPoster,
  getUserPosters,
  getPosterById,
  deletePoster,
} from '../controllers/poster.controller';
import { authenticateToken } from '../middleware/authMiddleware'; 

const router = Router();

router.post('/', authenticateToken, createPoster);
router.get('/user/:userId', authenticateToken, getUserPosters);
router.get('/:id', authenticateToken, getPosterById);
router.delete('/:id', authenticateToken, deletePoster);

export default router;