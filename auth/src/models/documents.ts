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

  pipelineStartedAt?: Date;
  pipelineCompletedAt?: Date;

  errorMessage?: string;

  deletedAt?: Date | null;

  createdAt: Date;
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

    pipelineStartedAt: {
      type: Date,
    },

    pipelineCompletedAt: {
      type: Date,
    },

    errorMessage: {
      type: String,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * 🔥 PERFORMANCE INDEX
 * Optimizes queries like:
 * find({ auth0Id }).sort({ createdAt: -1 })
 */
DocumentSchema.index({ auth0Id: 1, createdAt: -1 });

const DocumentModel: Model<IDocument> =
  mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
