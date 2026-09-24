import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * @desc Get all doctors with search, filters, pagination and patient count
 * @route GET /api/doctors
 */
export const getDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, specialization, hospital, startDate, endDate } = req.query as any;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const matchConditions: any = {};

    // Search filter (text regex or full-text)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      matchConditions.$or = [
        { name: searchRegex },
        { hospital: searchRegex },
        { specialization: searchRegex },
        { email: searchRegex },
      ];
    }

    // Specialization filter
    if (specialization && typeof specialization === 'string' && specialization.trim() !== '') {
      matchConditions.specialization = specialization.trim();
    }

    // Hospital filter
    if (hospital && typeof hospital === 'string' && hospital.trim() !== '') {
      matchConditions.hospital = hospital.trim();
    }

    // Date-wise filter (createdAt)
    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) {
        matchConditions.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        matchConditions.createdAt.$lte = end;
      }
    }

    // High performance MongoDB Aggregation with $facet
    const pipeline: any[] = [
      { $match: matchConditions },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'patients',
                localField: '_id',
                foreignField: 'doctorId',
                as: 'patients',
              },
            },
            {
              $addFields: {
                patientCount: { $size: '$patients' },
              },
            },
            {
              $project: {
                patients: 0,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const results = await Doctor.aggregate(pipeline);
    const data = results[0]?.data || [];
    const total = results[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Also get distinct specializations and hospitals for frontend filter dropdowns
    const [specializations, hospitals] = await Promise.all([
      Doctor.distinct('specialization'),
      Doctor.distinct('hospital'),
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        specializations,
        hospitals,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a new doctor
 * @route POST /api/doctors
 */
export const createDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      throw new AppError(`A doctor with email ${email} already exists`, 409);
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email: email.toLowerCase(),
    });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: {
        ...doctor.toObject(),
        patientCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get doctor by ID with corresponding patients
 * @route GET /api/doctors/:id
 */
export const getDoctorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Doctor ID format', 400);
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const patients = await Patient.find({ doctorId: doctor._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...doctor.toObject(),
        patientCount: patients.length,
        patients,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc View corresponding patients for a specific doctor with search & pagination
 * @route GET /api/doctors/:id/patients
 */
export const getDoctorPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { search, condition } = req.query as any;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Doctor ID format', 400);
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const matchQuery: any = { doctorId: doctor._id };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      matchQuery.$or = [{ name: searchRegex }, { phone: searchRegex }];
    }

    if (condition && condition.trim() !== '') {
      matchQuery.condition = condition.trim();
    }

    const [patients, total] = await Promise.all([
      Patient.find(matchQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments(matchQuery),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
      },
      data: patients,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add a new patient under a specific doctor
 * @route POST /api/doctors/:id/patients
 */
export const addPatientToDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, age, gender, condition, phone, admissionDate, medicalNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid Doctor ID format', 400);
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      condition,
      phone,
      doctorId: doctor._id,
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
      medicalNotes,
    });

    res.status(201).json({
      success: true,
      message: `Patient assigned to Dr. ${doctor.name} successfully`,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a patient from the doctor's patient list
 * @route DELETE /api/doctors/:id/patients/:patientId
 */
export const removePatientFromDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(patientId)) {
      throw new AppError('Invalid ID resource format', 400);
    }

    const patient = await Patient.findOneAndDelete({ _id: patientId, doctorId: id });
    if (!patient) {
      throw new AppError('Patient not found under this doctor', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Patient removed from doctor list successfully',
      data: { id: patientId },
    });
  } catch (error) {
    next(error);
  }
};
