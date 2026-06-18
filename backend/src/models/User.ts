import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'admin';
  googleId?: string;
  githubId?: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  ecoPoints: number;
  badges: string[];
  sustainabilityRank: string;
  city?: string;
  bio?: string;
  totalCarbonFootprint: number;
  carbonSaved: number;
  treesPlanted: number;
  environmentalScore: number;
  streak: number;
  lastActive: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String },
  githubId: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  ecoPoints: { type: Number, default: 0 },
  badges: [{ type: String }],
  sustainabilityRank: { type: String, default: 'Eco Beginner' },
  city: { type: String },
  bio: { type: String },
  totalCarbonFootprint: { type: Number, default: 0 },
  carbonSaved: { type: Number, default: 0 },
  treesPlanted: { type: Number, default: 0 },
  environmentalScore: { type: Number, default: 50 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
