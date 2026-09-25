"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectAdmin = void 0;
const token_js_1 = require("../utils/token.js");
const User_js_1 = require("../models/User.js");
const protectAdmin = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Authentication token missing.',
            });
            return;
        }
        const decoded = (0, token_js_1.verifyToken)(token);
        const user = await User_js_1.User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid session. User no longer exists.',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized. Invalid or expired authentication token.',
        });
    }
};
exports.protectAdmin = protectAdmin;
