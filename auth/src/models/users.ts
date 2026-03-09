import mongoose, { Schema, Document } from "mongoose";

// 1. Define the TypeScript Interface for perfect autocomplete
export interface IUser extends Document {
  auth0Id: string;
  email?: string;
  name?: string;
  createdAt: Date;
}

// 2. Define the Mongoose Schema
const UserSchema: Schema = new Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: { type: String },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// 3. Export the model safely
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
