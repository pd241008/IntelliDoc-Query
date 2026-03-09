import mongoose, { Schema, Document } from "mongoose";

// 1. Define the TypeScript Interface
export interface IDoc extends Document {
  fileId: string;
  auth0Id: string;
  filename: string;
  status: "pending" | "processing" | "ready" | "error";
  uploadedAt: Date;
}

// 2. Define the Mongoose Schema
const DocumentSchema: Schema = new Schema({
  fileId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  auth0Id: {
    type: String,
    required: true,
    index: true,
  },
  filename: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "ready", "error"],
    default: "pending",
  },
  uploadedAt: { type: Date, default: Date.now },
});

// 3. Export the model safely
export default mongoose.models.Document ||
  mongoose.model<IDoc>("Document", DocumentSchema);
