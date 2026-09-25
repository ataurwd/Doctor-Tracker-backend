"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientsPerDoctor = exports.getTrends = exports.getSummary = void 0;
const Doctor_js_1 = require("../models/Doctor.js");
const Patient_js_1 = require("../models/Patient.js");
/**
 * @desc Get high-level KPI metrics & condition summary for dashboard
 * @route GET /api/analytics/summary
 */
const getSummary = async (req, res, next) => {
    try {
        const [totalDoctors, totalPatients, conditionCounts] = await Promise.all([
            Doctor_js_1.Doctor.countDocuments(),
            Patient_js_1.Patient.countDocuments(),
            Patient_js_1.Patient.aggregate([
                {
                    $group: {
                        _id: '$condition',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);
        const avgPatientsPerDoctor = totalDoctors > 0 ? parseFloat((totalPatients / totalDoctors).toFixed(1)) : 0;
        const conditionMap = {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getSummary = getSummary;
/**
 * @desc Get date-based patient admission trends for chart visualizer
 * @route GET /api/analytics/trends
 */
const getTrends = async (req, res, next) => {
    try {
        const { range } = req.query; // '30days' | '60days' | 'all'
        const matchStage = {};
        const now = new Date();
        if (range === '30days') {
            const past30 = new Date();
            past30.setDate(now.getDate() - 30);
            matchStage.admissionDate = { $gte: past30 };
        }
        else if (range === '60days') {
            const past60 = new Date();
            past60.setDate(now.getDate() - 60);
            matchStage.admissionDate = { $gte: past60 };
        }
        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        pipeline.push({
            $group: {
                _id: {
                    year: { $year: '$admissionDate' },
                    month: { $month: '$admissionDate' },
                    day: { $dayOfMonth: '$admissionDate' },
                },
                count: { $sum: 1 },
                date: { $first: '$admissionDate' },
            },
        }, { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }, { $limit: 60 }, {
            $project: {
                _id: 0,
                date: {
                    $dateToString: { format: '%Y-%m-%d', date: '$date' },
                },
                admissions: '$count',
            },
        });
        const trends = await Patient_js_1.Patient.aggregate(pipeline);
        res.status(200).json({
            success: true,
            data: trends,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTrends = getTrends;
/**
 * @desc Get patients per doctor distribution for bar chart
 * @route GET /api/analytics/patients-per-doctor
 */
const getPatientsPerDoctor = async (req, res, next) => {
    try {
        const distribution = await Doctor_js_1.Doctor.aggregate([
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPatientsPerDoctor = getPatientsPerDoctor;
