import express, { Request, Response } from "express";
import DocumentModel from "../../models/documents";

const router = express.Router();

/**
 * GET USER DOCUMENTS
 * /api/documents/:auth0Id
 */
router.get("/documents/:auth0Id", async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.params;

    const documents = await DocumentModel.find({
      auth0Id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Fetch documents error:", error);

    res.status(500).json({
      error: "Failed to fetch documents",
    });
  }
});

export default router;
