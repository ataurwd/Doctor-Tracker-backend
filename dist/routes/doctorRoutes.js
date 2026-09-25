"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctorController_js_1 = require("../controllers/doctorController.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const validateRequest_js_1 = require("../middlewares/validateRequest.js");
const doctorValidators_js_1 = require("../validators/doctorValidators.js");
const patientValidators_js_1 = require("../validators/patientValidators.js");
const router = (0, express_1.Router)();
// All doctor routes are protected for authenticated administrative users
router.use(authMiddleware_js_1.protectAdmin);
router.get('/', (0, validateRequest_js_1.validateRequest)({ query: doctorValidators_js_1.queryDoctorSchema }), doctorController_js_1.getDoctors);
router.post('/', (0, validateRequest_js_1.validateRequest)({ body: doctorValidators_js_1.createDoctorSchema }), doctorController_js_1.createDoctor);
router.get('/:id', doctorController_js_1.getDoctorById);
router.get('/:id/patients', doctorController_js_1.getDoctorPatients);
router.post('/:id/patients', (0, validateRequest_js_1.validateRequest)({ body: patientValidators_js_1.createPatientSchema }), doctorController_js_1.addPatientToDoctor);
router.delete('/:id/patients/:patientId', doctorController_js_1.removePatientFromDoctor);
exports.default = router;
