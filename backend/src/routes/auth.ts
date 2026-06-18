import { Router, Request, Response, NextFunction } from 'express';
import { register, login, forgotPassword, resetPassword, verifyEmail, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';
import passport, { buildOAuthRedirect } from '../config/passport';

const router = Router();

// ── Standard auth ────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);
router.get('/me', protect, getMe);

// ── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  (req: Request, res: Response) => {
    const redirectUrl = buildOAuthRedirect(req.user);
    res.redirect(redirectUrl);
  }
);

// ── GitHub OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_failed` }),
  (req: Request, res: Response) => {
    const redirectUrl = buildOAuthRedirect(req.user);
    res.redirect(redirectUrl);
  }
);

export default router;
