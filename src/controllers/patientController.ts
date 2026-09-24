import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * @desc Get all patients with search, condition filter, date filter, doctor filter & pagination
 * @route GET /api/patients
 */
export const getPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, condition, doctorId, startDate, endDate } = req.query as any;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const matchConditions: any = {};

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
    if (doctorId && typeof doctorId === 'string' && mongoose.Types.ObjectId.isValid(doctorId)) {
      matchConditions.doctorId = new mongoose.Types.ObjectId(doctorId);
    }

    // Date-wise filtering on admissionDate
    if (startDate || endDate) {
      matchConditions.admissionDate = {};
      if (startDate) {
        matchConditions.admissionDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        matchConditions.admissionDate.$lte = end;
      }
    }

    const [patients, total] = await Promise.all([
      Patient.find(matchConditions)
        .populate('doctorId', 'name specialization hospital email')
        .sort({ admissionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(matchConditions),
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
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single patient by ID
 * @route GET /api/patients/:id
 */
export const getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Patient ID format', 400);
    }

    const patient = await Patient.findById(id).populate('doctorId', 'name specialization hospital email');
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Edit patient information
 * @route PUT /api/patients/:id
 */
export const updatePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, age, gender, condition, phone, doctorId, admissionDate, medicalNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Patient ID format', 400);
    }

    // If changing doctor, ensure new doctor exists
    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new AppError('Invalid Doctor ID format', 400);
      }
      const doctorExists = await Doctor.findById(doctorId);
      if (!doctorExists) {
        throw new AppError('Target doctor not found', 404);
      }
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (age !== undefined) updateFields.age = age;
    if (gender !== undefined) updateFields.gender = gender;
    if (condition !== undefined) updateFields.condition = condition;
    if (phone !== undefined) updateFields.phone = phone;
    if (doctorId !== undefined) updateFields.doctorId = doctorId;
    if (admissionDate !== undefined) updateFields.admissionDate = new Date(admissionDate);
    if (medicalNotes !== undefined) updateFields.medicalNotes = medicalNotes;

    const patient = await Patient.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('doctorId', 'name specialization hospital email');

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Patient information updated successfully',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete patient
 * @route DELETE /api/patients/:id
 */
export const deletePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Patient ID format', 400);
    }

    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
