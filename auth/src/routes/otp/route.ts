import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { OTP } from "../../models/otp.model";
import { sendOTPEmail } from "../../utils/email";
import crypto from "crypto";

const router = Router();

// Rate limiter for IP-based spam protection
const ipRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per `window` (here, per hour)
  message: { error: "Too many requests from this IP, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for specific email addresses
const emailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each Email to 3 requests per `window`
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },
  message: { error: "Too many requests for this email address, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/send", ipRateLimiter, emailRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if the email is an authorized admin email
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
    if (!adminEmails.includes(email)) {
      // Return 200 to prevent email enumeration attacks, but don't actually send
      return res.status(200).json({ message: "If you are an admin, an OTP has been sent." });
    }

    // Generate a secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // In a production app, we would hash this OTP using bcrypt before saving.
    // For simplicity and since it has a 5 min TTL, we'll store as plaintext or simple hash.
    // Here we store it as plaintext for easy verification.
    
    // Delete any existing OTPs for this email to prevent spamming
    await OTP.deleteMany({ email });

    await OTP.create({ email, otp });

    // Send email (mocked or real depending on SMTP config)
    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "If you are an admin, an OTP has been sent." });
  } catch (error) {
    console.error("Error in /otp/send:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/verify", ipRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Find the OTP in the database
    const record = await OTP.findOne({ email });

    if (!record) {
      return res.status(400).json({ error: "OTP expired or invalid" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Successfully verified, delete the OTP to prevent reuse
    await OTP.deleteOne({ _id: record._id });

    // In a real application, issue a JWT or set a session cookie here.
    // For this microservice, we will return a success flag and let the frontend handle session.
    // Alternatively, issue a short-lived admin token.
    return res.status(200).json({ 
      success: true, 
      message: "Admin authenticated successfully",
      // Optional: Generate a custom JWT for the frontend to use
      adminToken: "mock-admin-token-12345" 
    });

  } catch (error) {
    console.error("Error in /otp/verify:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
