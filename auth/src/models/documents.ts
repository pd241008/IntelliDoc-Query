import mongoose, { Schema, Document, Model } from "mongoose";

export type DocumentStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "vectorizing"
  | "ready"
  | "error";

export interface IDocument extends Document {
  fileId: string;
  auth0Id: string;

  filename: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;

  status: DocumentStatus;

  pageCount?: number;

  vectorIndexed: boolean;

  uploadedAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
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

    filename: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
    },

    mimeType: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "uploading",
        "processing",
        "vectorizing",
        "ready",
        "error",
      ],
      default: "pending",
      index: true,
    },

    pageCount: {
      type: Number,
    },

    vectorIndexed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const DocumentModel: Model<IDocument> =
  mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
