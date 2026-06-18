import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { comparePassword } from '../models/User';
import { sendEmail } from '../utils/email';

const generateToken = (id: string, role: string): string =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'ecotrack_secret', { expiresIn: '30d' });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) { res.status(400).json({ success: false, message: 'Email already registered' }); return; }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;
    
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        verificationToken,
      },
    });

    await sendEmail({
      to: email,
      subject: 'Verify your EcoTrack account',
      html: `<h2>Welcome to EcoTrack!</h2><p>Click <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">here</a> to verify your email.</p>`,
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email to verify your account.',
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.password || !(await comparePassword(password, user.password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' }); return;
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    res.json({
      success: true,
      token: generateToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, ecoPoints: user.ecoPoints },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() } });
    if (!user) { res.status(404).json({ success: false, message: 'No account with that email' }); return; }
    
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
      },
    });

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
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: req.body.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });
    if (!user) { res.status(400).json({ success: false, message: 'Invalid or expired token' }); return; }
    
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed', error });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: req.query.token as string,
      },
    });
    if (!user) { res.status(400).json({ success: false, message: 'Invalid verification token' }); return; }
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed', error });
  }
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user', error });
  }
};
