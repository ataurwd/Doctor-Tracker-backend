"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_js_1 = require("../controllers/analyticsController.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = (0, express_1.Router)();
// All analytics routes are protected for authenticated administrative users
router.use(authMiddleware_js_1.protectAdmin);
router.get('/summary', analyticsController_js_1.getSummary);
router.get('/trends', analyticsController_js_1.getTrends);
router.get('/patients-per-doctor', analyticsController_js_1.getPatientsPerDoctor);
exports.default = router;
