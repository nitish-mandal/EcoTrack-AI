import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

export type IUser = User;

export const comparePassword = async (candidatePassword: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hash);
};
