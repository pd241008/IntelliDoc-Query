// auth/src/config/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing from .env");

    // We add specific options to bypass Node.js DNS resolution bugs and network hangs
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5 seconds instead of hanging forever
      family: 4, // CRITICAL: Forces Node to use IPv4 instead of IPv6
    });

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Exit process with failure
  }
};
