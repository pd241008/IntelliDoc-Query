import express from "express";
import DocumentModel from "../../models/documents";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fileId, auth0Id, filename, fileUrl, fileSize, mimeType } = req.body;

    if (!fileId || !auth0Id || !filename || !fileUrl) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const doc = await DocumentModel.create({
      fileId,
      auth0Id,
      filename,
      fileUrl,
      fileSize,
      mimeType,
      status: "processing",
      vectorIndexed: false,
    });

    res.json({
      success: true,
      document: doc,
    });
  } catch (error) {
    console.error("Create document error:", error);

    res.status(500).json({
      error: "Document creation failed",
    });
  }
});

export default router;
