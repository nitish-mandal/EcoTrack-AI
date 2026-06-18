import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      try {
        console.log('🔄 Attempting connection to local MongoDB (2s timeout)...');
        const conn = await mongoose.connect('mongodb://localhost:27017/ecotrack', {
          serverSelectionTimeoutMS: 2000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (err) {
        console.log('⚠️ Local MongoDB connection failed. Starting in-memory MongoDB database...');
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongoServer = await MongoMemoryServer.create({
            binary: {
              version: '4.4.15',
            }
          });
          mongoUri = mongoServer.getUri();
        } catch (innerErr) {
          console.error('❌ Failed to start in-memory MongoDB database:', innerErr);
          throw innerErr;
        }
      }
    }

    const conn = await mongoose.connect(mongoUri!);
    console.log(`✅ MongoDB Connected (In-Memory/Atlas): ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️ Server running without active database connection.');
  }
};


