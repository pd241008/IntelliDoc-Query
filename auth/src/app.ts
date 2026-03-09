// auth/src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./utils/db/db"; // ✅ Just add the DB connection
import { loadExpressKit, ExpressKitError } from "./config/expresskit.bridge";

const app = express();

// 1. Initialize MongoDB
connectDB();

// 2. Global Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

// 3. Fire up the ExpressKit Engine (Auto-loads your user routes!)
loadExpressKit(app);

// 4. Global Error Handler
app.use(ExpressKitError);

export default app;
