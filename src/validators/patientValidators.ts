import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(2, 'Patient name must be at least 2 characters'),
  age: z.coerce.number().min(0, 'Age must be 0 or greater').max(130, 'Invalid age'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Gender must be Male, Female, or Other' }),
  }),
  condition: z.enum(['Critical', 'Stable', 'Recovering', 'Routine Checkup', 'Under Observation'], {
    errorMap: () => ({ message: 'Please select a valid condition' }),
  }),
  phone: z.string().min(6, 'Valid phone number is required'),
  doctorId: z.string().min(1, 'Doctor ID is required').optional(),
  admissionDate: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export const updatePatientSchema = z.object({
  name: z.string().min(2).optional(),
  age: z.coerce.number().min(0).max(130).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  condition: z.enum(['Critical', 'Stable', 'Recovering', 'Routine Checkup', 'Under Observation']).optional(),
  phone: z.string().min(6).optional(),
  doctorId: z.string().optional(),
  admissionDate: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export const queryPatientSchema = z.object({
  search: z.string().optional(),
  condition: z.string().optional(),
  doctorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});
