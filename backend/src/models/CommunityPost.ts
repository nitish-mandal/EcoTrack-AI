import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  comments: {
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  type: 'post' | 'achievement' | 'challenge_completion';
  challengeId?: mongoose.Types.ObjectId;
}

const CommunityPostSchema = new Schema<ICommunityPost>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  tags: [{ type: String }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
  type: { type: String, enum: ['post','achievement','challenge_completion'], default: 'post' },
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge' },
}, { timestamps: true });

export default mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
