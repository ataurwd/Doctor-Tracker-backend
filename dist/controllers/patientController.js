"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePatient = exports.updatePatient = exports.getPatientById = exports.getPatients = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Patient_js_1 = require("../models/Patient.js");
const Doctor_js_1 = require("../models/Doctor.js");
const errorHandler_js_1 = require("../middlewares/errorHandler.js");
/**
 * @desc Get all patients with search, condition filter, date filter, doctor filter & pagination
 * @route GET /api/patients
 */
const getPatients = async (req, res, next) => {
    try {
        const { search, condition, doctorId, startDate, endDate } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const matchConditions = {};
        // Search by patient name or phone
        if (search && typeof search === 'string' && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            matchConditions.$or = [
                { name: searchRegex },
                { phone: searchRegex },
                { medicalNotes: searchRegex },
            ];
        }
        // Filter by condition
        if (condition && typeof condition === 'string' && condition.trim() !== '') {
            matchConditions.condition = condition.trim();
        }
        // Filter by doctor
        if (doctorId && typeof doctorId === 'string' && mongoose_1.default.Types.ObjectId.isValid(doctorId)) {
            matchConditions.doctorId = new mongoose_1.default.Types.ObjectId(doctorId);
        }
        // Date-wise filtering on admissionDate
        if (startDate || endDate) {
            matchConditions.admissionDate = {};
            if (startDate) {
                matchConditions.admissionDate.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchConditions.admissionDate.$lte = end;
            }
        }
        const [patients, total] = await Promise.all([
            Patient_js_1.Patient.find(matchConditions)
                .populate('doctorId', 'name specialization hospital email')
                .sort({ admissionDate: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Patient_js_1.Patient.countDocuments(matchConditions),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        // Available conditions for filter options
        const conditions = ['Critical', 'Stable', 'Recovering', 'Routine Checkup', 'Under Observation'];
        res.status(200).json({
            success: true,
            data: patients,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            filters: {
                conditions,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPatients = getPatients;
/**
 * @desc Get single patient by ID
 * @route GET /api/patients/:id
 */
const getPatientById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errorHandler_js_1.AppError('Invalid Patient ID format', 400);
        }
        const patient = await Patient_js_1.Patient.findById(id).populate('doctorId', 'name specialization hospital email');
        if (!patient) {
            throw new errorHandler_js_1.AppError('Patient not found', 404);
        }
        res.status(200).json({
            success: true,
            data: patient,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPatientById = getPatientById;
/**
 * @desc Edit patient information
 * @route PUT /api/patients/:id
 */
const updatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, age, gender, condition, phone, doctorId, admissionDate, medicalNotes } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errorHandler_js_1.AppError('Invalid Patient ID format', 400);
        }
        // If changing doctor, ensure new doctor exists
        if (doctorId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(doctorId)) {
                throw new errorHandler_js_1.AppError('Invalid Doctor ID format', 400);
            }
            const doctorExists = await Doctor_js_1.Doctor.findById(doctorId);
            if (!doctorExists) {
                throw new errorHandler_js_1.AppError('Target doctor not found', 404);
            }
        }
        const updateFields = {};
        if (name !== undefined)
            updateFields.name = name;
        if (age !== undefined)
            updateFields.age = age;
        if (gender !== undefined)
            updateFields.gender = gender;
        if (condition !== undefined)
            updateFields.condition = condition;
        if (phone !== undefined)
            updateFields.phone = phone;
        if (doctorId !== undefined)
            updateFields.doctorId = doctorId;
        if (admissionDate !== undefined)
            updateFields.admissionDate = new Date(admissionDate);
        if (medicalNotes !== undefined)
            updateFields.medicalNotes = medicalNotes;
        const patient = await Patient_js_1.Patient.findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true,
        }).populate('doctorId', 'name specialization hospital email');
        if (!patient) {
            throw new errorHandler_js_1.AppError('Patient not found', 404);
        }
        res.status(200).json({
            success: true,
            message: 'Patient information updated successfully',
            data: patient,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePatient = updatePatient;
/**
 * @desc Delete patient
 * @route DELETE /api/patients/:id
 */
const deletePatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errorHandler_js_1.AppError('Invalid Patient ID format', 400);
        }
        const patient = await Patient_js_1.Patient.findByIdAndDelete(id);
        if (!patient) {
            throw new errorHandler_js_1.AppError('Patient not found', 404);
        }
        res.status(200).json({
            success: true,
            message: 'Patient deleted successfully',
            data: { id },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePatient = deletePatient;
