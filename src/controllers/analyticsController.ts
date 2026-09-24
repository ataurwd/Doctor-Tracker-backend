import { Request, Response, NextFunction } from 'express';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';

/**
 * @desc Get high-level KPI metrics & condition summary for dashboard
 * @route GET /api/analytics/summary
 */
export const getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalDoctors, totalPatients, conditionCounts] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.aggregate([
        {
          $group: {
            _id: '$condition',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const avgPatientsPerDoctor = totalDoctors > 0 ? parseFloat((totalPatients / totalDoctors).toFixed(1)) : 0;

    const conditionMap: Record<string, number> = {
      Critical: 0,
      Stable: 0,
      Recovering: 0,
      'Routine Checkup': 0,
      'Under Observation': 0,
    };

    conditionCounts.forEach((item) => {
      if (item._id) {
        conditionMap[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        avgPatientsPerDoctor,
        criticalCases: conditionMap['Critical'] || 0,
        stableCases: conditionMap['Stable'] || 0,
        recoveringCases: conditionMap['Recovering'] || 0,
        conditionDistribution: conditionCounts.map((item) => ({
          condition: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get date-based patient admission trends for chart visualizer
 * @route GET /api/analytics/trends
 */
export const getTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range } = req.query; // '30days' | '6months' | 'year'

    // Group patients by date (month or day)
    const trends = await Patient.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$admissionDate' },
            month: { $month: '$admissionDate' },
            day: { $dayOfMonth: '$admissionDate' },
          },
          count: { $sum: 1 },
          date: { $first: '$admissionDate' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          admissions: '$count',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get patients per doctor distribution for bar chart
 * @route GET /api/analytics/patients-per-doctor
 */
export const getPatientsPerDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const distribution = await Doctor.aggregate([
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'patients',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          specialization: 1,
          hospital: 1,
          patientCount: { $size: '$patients' },
        },
      },
      { $sort: { patientCount: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    next(error);
  }
};
