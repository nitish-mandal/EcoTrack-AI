import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'goal_reminder' | 'challenge_update' | 'ai_suggestion' | 'achievement' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  icon?: string;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['goal_reminder','challenge_update','ai_suggestion','achievement','system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String },
  icon: { type: String },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
