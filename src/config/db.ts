import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix for Node.js DNS SRV resolution issue on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported in environment
}

let mongoMemoryServerInstance: any = null;

export const connectDB = async (): Promise<string> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor_tracker';
  const dbName = process.env.DB_NAME || 'doctor_tracker';

  try {
    const conn = await mongoose.connect(mongoURI, {
      dbName,
      authSource: 'admin',
      serverSelectionTimeoutMS: 10000, // Sufficient for remote MongoDB Atlas handshake
    });
    console.log(`[MongoDB] Successfully connected to: ${conn.connection.host} | Active Database: "${conn.connection.name}"`);
    return conn.connection.host;
  } catch (error: any) {
    console.warn(`[MongoDB] Could not connect to remote URI (${error.message}). Initializing embedded database fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(inMemoryUri, {
        dbName,
      });
      console.log(`[MongoDB] Embedded in-memory MongoDB connected: ${inMemoryUri} | Active Database: "${conn.connection.name}"`);
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
