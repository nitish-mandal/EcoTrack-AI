import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningContent extends Document {
  title: string;
  topic: 'climate_change' | 'recycling' | 'renewable_energy' | 'sustainable_living';
  type: 'article' | 'video' | 'quiz' | 'infographic';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  readTime?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  quiz?: { question: string; options: string[]; correctAnswer: number }[];
  ecoPointsReward: number;
  published: boolean;
}

const LearningContentSchema = new Schema<ILearningContent>({
  title: { type: String, required: true },
  topic: { type: String, enum: ['climate_change','recycling','renewable_energy','sustainable_living'], required: true },
  type: { type: String, enum: ['article','video','quiz','infographic'], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  videoUrl: { type: String },
  readTime: { type: Number },
  difficulty: { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number,
  }],
  ecoPointsReward: { type: Number, default: 10 },
  published: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ILearningContent>('LearningContent', LearningContentSchema);
