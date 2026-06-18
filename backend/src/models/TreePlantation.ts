import mongoose, { Document, Schema } from 'mongoose';

export interface ITreePlantation extends Document {
  userId: mongoose.Types.ObjectId;
  species: string;
  count: number;
  location: string;
  imageUrl?: string;
  plantedAt: Date;
  co2AbsorbedPerYear: number;
  totalCo2Absorbed: number;
  notes?: string;
}

const TreePlantationSchema = new Schema<ITreePlantation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  species: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  location: { type: String, required: true },
  imageUrl: { type: String },
  plantedAt: { type: Date, default: Date.now },
  co2AbsorbedPerYear: { type: Number, default: 21 },
  totalCo2Absorbed: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model<ITreePlantation>('TreePlantation', TreePlantationSchema);
