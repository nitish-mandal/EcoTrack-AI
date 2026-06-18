import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendEmail } from '../utils/email';

const generateToken = (id: string, role: string): string =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'ecotrack_secret', { expiresIn: '30d' });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) { res.status(400).json({ success: false, message: 'Email already registered' }); return; }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, password, verificationToken });
    await sendEmail({
      to: email,
      subject: 'Verify your EcoTrack account',
      html: `<h2>Welcome to EcoTrack!</h2><p>Click <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">here</a> to verify your email.</p>`,
    });
    res.status(201).json({ success: true, message: 'Registration successful. Check your email to verify your account.', token: generateToken(user._id.toString(), user.role) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' }); return;
    }
    user.lastActive = new Date();
    await user.save();
    res.json({ success: true, token: generateToken(user._id.toString(), user.role), user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, ecoPoints: user.ecoPoints } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) { res.status(404).json({ success: false, message: 'No account with that email' }); return; }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'EcoTrack Password Reset',
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">here</a> to reset your password. Expires in 1 hour.</p>`,
    });
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending reset email', error });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) { res.status(400).json({ success: false, message: 'Invalid or expired token' }); return; }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed', error });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ verificationToken: req.query.token });
    if (!user) { res.status(400).json({ success: false, message: 'Invalid verification token' }); return; }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed', error });
  }
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user', error });
  }
};
