import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  auth0Id: string;
  email?: string;
  name?: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      index: true,
    },

    name: {
      type: String,
    },

    picture: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
