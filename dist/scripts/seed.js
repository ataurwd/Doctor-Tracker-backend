"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_js_1 = require("../models/User.js");
const Doctor_js_1 = require("../models/Doctor.js");
const Patient_js_1 = require("../models/Patient.js");
const db_js_1 = require("../config/db.js");
dotenv_1.default.config();
const seedDatabase = async () => {
    try {
        console.log('[Seeder] Starting database seeding...');
        // Clear existing data
        await Promise.all([
            User_js_1.User.deleteMany({}),
            Doctor_js_1.Doctor.deleteMany({}),
            Patient_js_1.Patient.deleteMany({}),
        ]);
        // 1. Create Default Admin Users
        const users = await User_js_1.User.create([
            {
                name: 'Sarah Connor',
                email: 'admin@doctortracker.com',
                password: 'admin123',
                role: 'admin',
            },
            {
                name: 'Dr. Arthur Bell',
                email: 'director@doctortracker.com',
                password: 'director123',
                role: 'admin',
            },
            {
                name: 'Elena Vasquez',
                email: 'supervisor@doctortracker.com',
                password: 'supervisor123',
                role: 'admin',
            },
        ]);
        console.log(`[Seeder] Created ${users.length} admin accounts for quick login testing`);
        // 2. Create Doctors
        const doctorsData = [
            {
                name: 'Dr. Sarah Jenkins',
                specialization: 'Cardiology',
                hospital: 'Metropolitan General Hospital',
                phone: '+1 (555) 234-5678',
                email: 's.jenkins@metrohealth.org',
            },
            {
                name: 'Dr. Marcus Chen',
                specialization: 'Neurology',
                hospital: 'St. Jude Medical Center',
                phone: '+1 (555) 345-6789',
                email: 'm.chen@stjude.org',
            },
            {
                name: 'Dr. Elena Rostova',
                specialization: 'Pediatrics',
                hospital: 'City Children Memorial',
                phone: '+1 (555) 456-7890',
                email: 'e.rostova@citychildren.org',
            },
            {
                name: 'Dr. David Patel',
                specialization: 'Orthopedics',
                hospital: 'Metropolitan General Hospital',
                phone: '+1 (555) 567-8901',
                email: 'd.patel@metrohealth.org',
            },
            {
                name: 'Dr. Aisha Al-Mansoor',
                specialization: 'Oncology',
                hospital: 'Hope Cancer Institute',
                phone: '+1 (555) 678-9012',
                email: 'a.almansoor@hopecancer.org',
            },
            {
                name: 'Dr. Robert Hayes',
                specialization: 'Dermatology',
                hospital: 'Grace Memorial Clinic',
                phone: '+1 (555) 789-0123',
                email: 'r.hayes@graceclinic.org',
            },
            {
                name: 'Dr. Emily Watson',
                specialization: 'General Surgery',
                hospital: 'City Children Memorial',
                phone: '+1 (555) 890-1234',
                email: 'e.watson@citychildren.org',
            },
            {
                name: 'Dr. James Wilson',
                specialization: 'Psychiatry',
                hospital: 'St. Jude Medical Center',
                phone: '+1 (555) 901-2345',
                email: 'j.wilson@stjude.org',
            },
        ];
        const createdDoctors = await Doctor_js_1.Doctor.insertMany(doctorsData);
        console.log(`[Seeder] Created ${createdDoctors.length} doctors`);
        // Helper for random date in past N days
        const pastDate = (daysAgo) => {
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            return d;
        };
        // 3. Create Patients distributed across doctors
        const patientsData = [
            {
                name: 'Arthur Pendelton',
                age: 64,
                gender: 'Male',
                condition: 'Critical',
                phone: '+1 (555) 111-2233',
                doctorId: createdDoctors[0]._id,
                admissionDate: pastDate(2),
                medicalNotes: 'Arrhythmia and severe hypertension. Continuous ECG monitoring required.',
            },
            {
                name: 'Beatrice Vance',
                age: 52,
                gender: 'Female',
                condition: 'Stable',
                phone: '+1 (555) 222-3344',
                doctorId: createdDoctors[0]._id,
                admissionDate: pastDate(12),
                medicalNotes: 'Post-stent recovery. Blood pressure normalizing.',
            },
            {
                name: 'Charles Sterling',
                age: 45,
                gender: 'Male',
                condition: 'Recovering',
                phone: '+1 (555) 333-4455',
                doctorId: createdDoctors[0]._id,
                admissionDate: pastDate(25),
                medicalNotes: 'Cardiovascular rehabilitation progressing well.',
            },
            {
                name: 'Diana Prince',
                age: 38,
                gender: 'Female',
                condition: 'Under Observation',
                phone: '+1 (555) 444-5566',
                doctorId: createdDoctors[1]._id,
                admissionDate: pastDate(4),
                medicalNotes: 'Frequent migraine episodes and aura symptoms. MRI scan completed.',
            },
            {
                name: 'Ethan Hunt',
                age: 41,
                gender: 'Male',
                condition: 'Stable',
                phone: '+1 (555) 555-6677',
                doctorId: createdDoctors[1]._id,
                admissionDate: pastDate(18),
                medicalNotes: 'Post-concussion syndrome management. Cognitive function improving.',
            },
            {
                name: 'Fiona Gallagher',
                age: 8,
                gender: 'Female',
                condition: 'Routine Checkup',
                phone: '+1 (555) 666-7788',
                doctorId: createdDoctors[2]._id,
                admissionDate: pastDate(5),
                medicalNotes: 'Annual developmental milestones evaluation. All healthy.',
            },
            {
                name: 'George Weasley',
                age: 12,
                gender: 'Male',
                condition: 'Recovering',
                phone: '+1 (555) 777-8899',
                doctorId: createdDoctors[2]._id,
                admissionDate: pastDate(9),
                medicalNotes: 'Recovering from acute bronchitis with nebulizer treatment.',
            },
            {
                name: 'Hannah Abbott',
                age: 5,
                gender: 'Female',
                condition: 'Stable',
                phone: '+1 (555) 888-9900',
                doctorId: createdDoctors[2]._id,
                admissionDate: pastDate(22),
                medicalNotes: 'Vaccination and seasonal allergies consultation.',
            },
            {
                name: 'Ian Malcolm',
                age: 58,
                gender: 'Male',
                condition: 'Critical',
                phone: '+1 (555) 999-0011',
                doctorId: createdDoctors[3]._id,
                admissionDate: pastDate(1),
                medicalNotes: 'Compound femur fracture following vehicular accident. Scheduled for surgery.',
            },
            {
                name: 'Julia Roberts',
                age: 49,
                gender: 'Female',
                condition: 'Recovering',
                phone: '+1 (555) 000-1122',
                doctorId: createdDoctors[3]._id,
                admissionDate: pastDate(15),
                medicalNotes: 'Knee arthroscopy postoperative physical therapy.',
            },
            {
                name: 'Kevin Flynn',
                age: 62,
                gender: 'Male',
                condition: 'Critical',
                phone: '+1 (555) 123-4567',
                doctorId: createdDoctors[4]._id,
                admissionDate: pastDate(3),
                medicalNotes: 'Stage 3 lymphoma undergoing third chemotherapy cycle.',
            },
            {
                name: 'Laura Croft',
                age: 34,
                gender: 'Female',
                condition: 'Under Observation',
                phone: '+1 (555) 234-5670',
                doctorId: createdDoctors[4]._id,
                admissionDate: pastDate(14),
                medicalNotes: 'Biopsy analysis follow-up and monitoring.',
            },
            {
                name: 'Michael Scott',
                age: 47,
                gender: 'Male',
                condition: 'Routine Checkup',
                phone: '+1 (555) 345-6781',
                doctorId: createdDoctors[5]._id,
                admissionDate: pastDate(8),
                medicalNotes: 'Annual mole screening and eczema treatment.',
            },
            {
                name: 'Nancy Wheeler',
                age: 29,
                gender: 'Female',
                condition: 'Stable',
                phone: '+1 (555) 456-7892',
                doctorId: createdDoctors[5]._id,
                admissionDate: pastDate(30),
                medicalNotes: 'Topical treatment for contact dermatitis.',
            },
            {
                name: 'Oliver Queen',
                age: 39,
                gender: 'Male',
                condition: 'Recovering',
                phone: '+1 (555) 567-8903',
                doctorId: createdDoctors[6]._id,
                admissionDate: pastDate(7),
                medicalNotes: 'Appendectomy incision healing clean with no signs of infection.',
            },
            {
                name: 'Penny Hofstadter',
                age: 33,
                gender: 'Female',
                condition: 'Stable',
                phone: '+1 (555) 678-9014',
                doctorId: createdDoctors[6]._id,
                admissionDate: pastDate(20),
                medicalNotes: 'Laparoscopic cholecystectomy postoperative follow-up.',
            },
            {
                name: 'Quinn Fabray',
                age: 26,
                gender: 'Female',
                condition: 'Under Observation',
                phone: '+1 (555) 789-0125',
                doctorId: createdDoctors[7]._id,
                admissionDate: pastDate(6),
                medicalNotes: 'Severe anxiety and insomnia assessment.',
            },
            {
                name: 'Riley Matthews',
                age: 21,
                gender: 'Female',
                condition: 'Routine Checkup',
                phone: '+1 (555) 890-1236',
                doctorId: createdDoctors[7]._id,
                admissionDate: pastDate(40),
                medicalNotes: 'Bimonthly psychotherapy progress check.',
            },
            {
                name: 'Samuel Winchester',
                age: 36,
                gender: 'Male',
                condition: 'Stable',
                phone: '+1 (555) 901-2347',
                doctorId: createdDoctors[0]._id,
                admissionDate: pastDate(45),
                medicalNotes: 'Routine lipid profile and stress testing.',
            },
            {
                name: 'Tara Maclay',
                age: 30,
                gender: 'Female',
                condition: 'Stable',
                phone: '+1 (555) 012-3458',
                doctorId: createdDoctors[1]._id,
                admissionDate: pastDate(60),
                medicalNotes: 'Peripheral neuropathy monitoring.',
            },
            {
                name: 'Uma Thurman',
                age: 54,
                gender: 'Female',
                condition: 'Recovering',
                phone: '+1 (555) 123-8901',
                doctorId: createdDoctors[3]._id,
                admissionDate: pastDate(50),
                medicalNotes: 'Lumbar disc herniation physical therapy.',
            },
            {
                name: 'Victor Stone',
                age: 27,
                gender: 'Male',
                condition: 'Routine Checkup',
                phone: '+1 (555) 234-9012',
                doctorId: createdDoctors[4]._id,
                admissionDate: pastDate(70),
                medicalNotes: 'Post-remission quarterly checkup. Clear scans.',
            },
        ];
        const createdPatients = await Patient_js_1.Patient.insertMany(patientsData);
        console.log(`[Seeder] Created ${createdPatients.length} patients`);
        console.log('[Seeder] Database successfully seeded with realistic sample data!');
    }
    catch (error) {
        console.error('[Seeder] Seeding failed:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
// If run directly from terminal
if (process.argv[1]?.includes('seed.ts')) {
    (async () => {
        await (0, db_js_1.connectDB)();
        await (0, exports.seedDatabase)();
        await mongoose_1.default.disconnect();
        process.exit(0);
    })();
}
