import mongoose from 'mongoose';

let mongoMemoryServerInstance: any = null;

export const connectDB = async (): Promise<string> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor_tracker';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection.host;
  } catch (error: any) {
    console.warn(`[MongoDB] Could not connect to ${mongoURI} (${error.message}). Initializing embedded database fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Embedded in-memory MongoDB connected: ${inMemoryUri}`);
      return inMemoryUri;
    } catch (fallbackError: any) {
      console.error('[MongoDB] Failed to start fallback MongoDB:', fallbackError);
      throw fallbackError;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
