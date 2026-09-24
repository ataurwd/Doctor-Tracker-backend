import { z } from 'zod';

export const createDoctorSchema = z.object({
  name: z.string().min(2, 'Doctor name must be at least 2 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  hospital: z.string().min(2, 'Hospital name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  email: z.string().email('Please enter a valid email address'),
});

export const queryDoctorSchema = z.object({
  search: z.string().optional(),
  specialization: z.string().optional(),
  hospital: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});
