import mongoose, { Document, Schema } from 'mongoose';

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
  }[];
  sessionTitle: string;
}

const ChatHistorySchema = new Schema<IChatHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user','assistant','system'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  sessionTitle: { type: String, default: 'Eco Chat' },
}, { timestamps: true });

export default mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
