import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, verifyEmail, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);
router.get('/me', protect, getMe);

export default router;
