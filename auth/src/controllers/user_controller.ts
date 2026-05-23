import { Request, Response } from "express";
import { syncUserInDB } from "../services/user_service";

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  console.log("📥 Sync request received");
  console.log("📦 Request body:", req.body);
  console.log("🔐 Auth object:", req.auth);

  try {
    // Step 1: Verify Auth0 token exists
    const auth0Id = req.auth?.payload?.sub;

    if (!auth0Id) {
      console.log("❌ No Auth0 ID found in token");
      res.status(401).json({
        error: "Unauthorized: Missing Auth0 ID",
      });
      return;
    }

    console.log("✅ Auth0 ID verified:", auth0Id);

    const { email, name } = req.body;

    if (!email || !name) {
      console.log("❌ Missing email or name");
      res.status(400).json({
        error: "Missing required fields",
      });
      return;
    }

    console.log("✅ Request data verified:", { email, name });

    // 🔹 TEMP: return verification response instead of DB call
    res.status(200).json({
      success: true,
      message: "Step 1 verification successful",
      auth0Id,
      email,
      name,
      tokenPayload: req.auth?.payload,
    });

    // Step 2 will enable this later
    // const user = await syncUserInDB(auth0Id, email, name);
    // res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("❌ Error syncing user:", error);

    res.status(500).json({
      error: "Failed to sync user to database",
    });
  }
};
