"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryDoctorSchema = exports.createDoctorSchema = void 0;
const zod_1 = require("zod");
exports.createDoctorSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Doctor name must be at least 2 characters'),
    specialization: zod_1.z.string().min(2, 'Specialization is required'),
    hospital: zod_1.z.string().min(2, 'Hospital name is required'),
    phone: zod_1.z.string().min(6, 'Valid phone number is required'),
    email: zod_1.z.string().email('Please enter a valid email address'),
});
exports.queryDoctorSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    hospital: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});
