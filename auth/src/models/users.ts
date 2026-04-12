import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  auth0Id: string;
  email?: string;
  name?: string;
  picture?: string;

  role: string;

  lastLoginAt?: Date;

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

    role: {
      type: String,
      default: "user",
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Ensure fast lookup by Auth0 ID
 */
UserSchema.index({ auth0Id: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
