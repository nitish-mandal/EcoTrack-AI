import mongoose, { Document, Schema } from 'mongoose';

export interface ICarbonRecord extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  transportation: {
    car: number; bike: number; bus: number; train: number; metro: number; flight: number;
  };
  energy: { electricity: number; ac: number; appliances: number; };
  food: { vegetarian: number; vegan: number; mixed: number; meat: number; };
  waste: { plastic: number; organic: number; recyclable: number; };
  shopping: { clothing: number; electronics: number; };
  water: { daily: number; };
  dailyCO2: number;
  weeklyCO2: number;
  monthlyCO2: number;
  annualCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

const CarbonRecordSchema = new Schema<ICarbonRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  transportation: {
    car: { type: Number, default: 0 },
    bike: { type: Number, default: 0 },
    bus: { type: Number, default: 0 },
    train: { type: Number, default: 0 },
    metro: { type: Number, default: 0 },
    flight: { type: Number, default: 0 },
  },
  energy: {
    electricity: { type: Number, default: 0 },
    ac: { type: Number, default: 0 },
    appliances: { type: Number, default: 0 },
  },
  food: {
    vegetarian: { type: Number, default: 0 },
    vegan: { type: Number, default: 0 },
    mixed: { type: Number, default: 0 },
    meat: { type: Number, default: 0 },
  },
  waste: {
    plastic: { type: Number, default: 0 },
    organic: { type: Number, default: 0 },
    recyclable: { type: Number, default: 0 },
  },
  shopping: {
    clothing: { type: Number, default: 0 },
    electronics: { type: Number, default: 0 },
  },
  water: { daily: { type: Number, default: 0 } },
  dailyCO2: { type: Number, required: true },
  weeklyCO2: { type: Number, required: true },
  monthlyCO2: { type: Number, required: true },
  annualCO2: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<ICarbonRecord>('CarbonRecord', CarbonRecordSchema);
