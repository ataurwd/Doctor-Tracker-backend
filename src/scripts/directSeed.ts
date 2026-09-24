import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'node:dns';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { seedDatabase } from './seed.js';

dotenv.config();

// Ensure public DNS resolution on Windows for Atlas SRV
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const runDirectSeed = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'doctor_tracker';

  if (!uri) {
    console.error('ERROR: MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connecting directly to: ${maskedUri}`);
  console.log(`Target database: "${dbName}"`);

  try {
    console.log('Attempting connection with authSource: "admin"...');
    let conn;
    try {
      conn = await mongoose.connect(uri, {
        dbName,
        authSource: 'admin',
        serverSelectionTimeoutMS: 8000,
      });
    } catch (e1: any) {
      console.log('authSource "admin" failed (' + e1.message + '). Trying authSource "doctor_tracker"...');
      try {
        conn = await mongoose.connect(uri, {
          dbName,
          authSource: 'doctor_tracker',
          serverSelectionTimeoutMS: 8000,
        });
      } catch (e2: any) {
        console.log('authSource "doctor_tracker" failed (' + e2.message + '). Trying standard connection...');
        conn = await mongoose.connect(uri, {
          dbName,
          serverSelectionTimeoutMS: 8000,
        });
      }
    }

    console.log(`Successfully connected to: ${conn.connection.host}`);
    console.log(`Active Database name: "${conn.connection.name}"`);

    console.log('Now seeding all data from seed.ts directly into database...');
    await seedDatabase();

    const [userCount, doctorCount, patientCount] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Patient.countDocuments(),
    ]);

    console.log('\n--- SEEDING VERIFICATION ---');
    console.log(`Users in database "${conn.connection.name}":`, userCount);
    console.log(`Doctors in database "${conn.connection.name}":`, doctorCount);
    console.log(`Patients in database "${conn.connection.name}":`, patientCount);
    console.log('All data sent successfully to database!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('\nFAILED to connect/seed to MongoDB:');
    console.error(error.message);
    process.exit(1);
  }
};

runDirectSeed();
