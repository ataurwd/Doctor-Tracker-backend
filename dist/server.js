"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = require("./config/db.js");
const errorHandler_js_1 = require("./middlewares/errorHandler.js");
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const doctorRoutes_js_1 = __importDefault(require("./routes/doctorRoutes.js"));
const patientRoutes_js_1 = __importDefault(require("./routes/patientRoutes.js"));
const analyticsRoutes_js_1 = __importDefault(require("./routes/analyticsRoutes.js"));
const User_js_1 = require("./models/User.js");
const seed_js_1 = require("./scripts/seed.js");
const keepAlive_js_1 = require("./utils/keepAlive.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS for frontend applications
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
// API Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Doctor Tracker REST API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// Mount Routes
app.use('/api/auth', authRoutes_js_1.default);
app.use('/api/doctors', doctorRoutes_js_1.default);
app.use('/api/patients', patientRoutes_js_1.default);
app.use('/api/analytics', analyticsRoutes_js_1.default);
// Catch 404 for unhandled routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
});
// Global Error Handler
app.use(errorHandler_js_1.errorHandler);
// Start Server and verify DB seed
const startServer = async () => {
    try {
        await (0, db_js_1.connectDB)();
        // Check if initial seeding is needed
        const userCount = await User_js_1.User.countDocuments();
        if (userCount === 0) {
            console.log('[Server] Database is empty. Auto-seeding initial data...');
            await (0, seed_js_1.seedDatabase)();
        }
        const portNumber = Number(PORT) || 5000;
        app.listen(portNumber, '0.0.0.0', () => {
            console.log(`[Server] REST API listening on port ${portNumber}`);
            (0, keepAlive_js_1.initKeepAlive)();
        });
    }
    catch (error) {
        console.error('[Server] Startup error:', error);
    }
};
exports.startServer = startServer;
if (process.env.NODE_ENV !== 'test') {
    (0, exports.startServer)();
}
exports.default = app;
