import mongoose, { Document, Model, Schema } from 'mongoose';

export type PatientCondition = 'Critical' | 'Stable' | 'Recovering' | 'Routine Checkup' | 'Under Observation';
export type PatientGender = 'Male' | 'Female' | 'Other';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: PatientGender;
  condition: PatientCondition;
  phone: string;
  doctorId: mongoose.Types.ObjectId;
  admissionDate: Date;
  medicalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Age is out of realistic range'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    condition: {
      type: String,
      enum: ['Critical', 'Stable', 'Recovering', 'Routine Checkup', 'Under Observation'],
      required: [true, 'Patient condition is required'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Assigned doctor ID is required'],
      index: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    medicalNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// High performance compound indexes
patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1, admissionDate: -1 });
patientSchema.index({ admissionDate: -1 });
patientSchema.index({ name: 'text', phone: 'text' });

export const Patient: Model<IPatient> = mongoose.model<IPatient>('Patient', patientSchema);
