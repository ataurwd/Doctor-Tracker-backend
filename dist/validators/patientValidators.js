"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryPatientSchema = exports.updatePatientSchema = exports.createPatientSchema = void 0;
const zod_1 = require("zod");
exports.createPatientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Patient name must be at least 2 characters'),
    age: zod_1.z.coerce.number().min(0, 'Age must be 0 or greater').max(130, 'Invalid age'),
    gender: zod_1.z.enum(['Male', 'Female', 'Other'], {
        errorMap: () => ({ message: 'Gender must be Male, Female, or Other' }),
    }),
    condition: zod_1.z.enum(['Critical', 'Stable', 'Recovering', 'Routine Checkup', 'Under Observation'], {
        errorMap: () => ({ message: 'Please select a valid condition' }),
    }),
    phone: zod_1.z.string().min(6, 'Valid phone number is required'),
    doctorId: zod_1.z.string().min(1, 'Doctor ID is required').optional(),
    admissionDate: zod_1.z.string().optional(),
    medicalNotes: zod_1.z.string().optional(),
});
exports.updatePatientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    age: zod_1.z.coerce.number().min(0).max(130).optional(),
    gender: zod_1.z.enum(['Male', 'Female', 'Other']).optional(),
    condition: zod_1.z.enum(['Critical', 'Stable', 'Recovering', 'Routine Checkup', 'Under Observation']).optional(),
    phone: zod_1.z.string().min(6).optional(),
    doctorId: zod_1.z.string().optional(),
    admissionDate: zod_1.z.string().optional(),
    medicalNotes: zod_1.z.string().optional(),
});
exports.queryPatientSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    condition: zod_1.z.string().optional(),
    doctorId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});
