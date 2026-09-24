import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { User } from './models/User.js';
import { seedDatabase } from './scripts/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend applications
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Doctor Tracker REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch 404 for unhandled routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server and verify DB seed
export const startServer = async () => {
  try {
    await connectDB();

    // Check if initial seeding is needed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial data...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`[Server] REST API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Startup error:', error);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
