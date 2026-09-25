"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patientController_js_1 = require("../controllers/patientController.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const validateRequest_js_1 = require("../middlewares/validateRequest.js");
const patientValidators_js_1 = require("../validators/patientValidators.js");
const router = (0, express_1.Router)();
// All patient routes are protected for authenticated administrative users
router.use(authMiddleware_js_1.protectAdmin);
router.get('/', (0, validateRequest_js_1.validateRequest)({ query: patientValidators_js_1.queryPatientSchema }), patientController_js_1.getPatients);
router.get('/:id', patientController_js_1.getPatientById);
router.put('/:id', (0, validateRequest_js_1.validateRequest)({ body: patientValidators_js_1.updatePatientSchema }), patientController_js_1.updatePatient);
router.delete('/:id', patientController_js_1.deletePatient);
exports.default = router;
