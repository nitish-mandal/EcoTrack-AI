import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'carbon_reduction' | 'tree_planting' | 'electricity_reduction' | 'plastic_reduction' | 'custom';
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'active' | 'completed' | 'failed' | 'paused';
  milestones: { value: number; label: string; achieved: boolean; achievedAt?: Date }[];
  reminder: boolean;
  reminderFrequency: 'daily' | 'weekly';
  completedAt?: Date;
}

const GoalSchema = new Schema<IGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['carbon_reduction','tree_planting','electricity_reduction','plastic_reduction','custom'], required: true },
  description: { type: String },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  unit: { type: String, default: 'kg CO₂' },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['active','completed','failed','paused'], default: 'active' },
  milestones: [{
    value: Number,
    label: String,
    achieved: { type: Boolean, default: false },
    achievedAt: Date,
  }],
  reminder: { type: Boolean, default: false },
  reminderFrequency: { type: String, enum: ['daily','weekly'], default: 'weekly' },
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);
