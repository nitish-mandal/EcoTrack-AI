import mongoose, { Document, Schema } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: 'no_plastic' | 'walk_to_work' | 'save_electricity' | 'plant_trees' | 'custom';
  duration: number;
  startDate: Date;
  endDate: Date;
  participants: mongoose.Types.ObjectId[];
  completedBy: mongoose.Types.ObjectId[];
  badge: string;
  ecoPointsReward: number;
  status: 'upcoming' | 'active' | 'completed';
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  rules: string[];
}

const ChallengeSchema = new Schema<IChallenge>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['no_plastic','walk_to_work','save_electricity','plant_trees','custom'], required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  completedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  badge: { type: String },
  ecoPointsReward: { type: Number, default: 100 },
  status: { type: String, enum: ['upcoming','active','completed'], default: 'upcoming' },
  imageUrl: { type: String },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  category: { type: String },
  rules: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
