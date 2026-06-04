import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Documents will be automatically deleted after 5 minutes (300 seconds)
  }
});

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
