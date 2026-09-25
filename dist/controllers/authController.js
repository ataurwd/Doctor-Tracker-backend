"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = void 0;
const User_js_1 = require("../models/User.js");
const token_js_1 = require("../utils/token.js");
const errorHandler_js_1 = require("../middlewares/errorHandler.js");
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_js_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new errorHandler_js_1.AppError('Invalid email or password', 401);
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new errorHandler_js_1.AppError('Invalid email or password', 401);
        }
        const token = (0, token_js_1.generateToken)({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_js_1.AppError('User not authenticated', 401);
        }
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
