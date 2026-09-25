"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const node_dns_1 = __importDefault(require("node:dns"));
// Fix for Node.js DNS SRV resolution issue on Windows
try {
    node_dns_1.default.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}
catch (e) {
    // Ignore if not supported in environment
}
let mongoMemoryServerInstance = null;
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor_tracker';
    const dbName = process.env.DB_NAME || 'doctor_tracker';
    try {
        const conn = await mongoose_1.default.connect(mongoURI, {
            dbName,
            authSource: 'admin',
            serverSelectionTimeoutMS: 10000, // Sufficient for remote MongoDB Atlas handshake
        });
        console.log(`[MongoDB] Successfully connected to: ${conn.connection.host} | Active Database: "${conn.connection.name}"`);
        return conn.connection.host;
    }
    catch (error) {
        console.warn(`[MongoDB] Could not connect to remote URI (${error.message}). Initializing embedded database fallback...`);
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            mongoMemoryServerInstance = await MongoMemoryServer.create();
            const inMemoryUri = mongoMemoryServerInstance.getUri();
            const conn = await mongoose_1.default.connect(inMemoryUri, {
                dbName,
            });
            console.log(`[MongoDB] Embedded in-memory MongoDB connected: ${inMemoryUri} | Active Database: "${conn.connection.name}"`);
            return inMemoryUri;
        }
        catch (fallbackError) {
            console.error('[MongoDB] Failed to start fallback MongoDB:', fallbackError);
            throw fallbackError;
        }
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.disconnect();
    if (mongoMemoryServerInstance) {
        await mongoMemoryServerInstance.stop();
    }
};
exports.disconnectDB = disconnectDB;
