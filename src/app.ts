 import cors from "cors";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose"; // NEW: Import mongoose
// import Agendash from "agendash";

import * as errorMiddlewares from "./api/middlewares/errorMiddlewares";
import responseUtilities from "./api/middlewares/responseUtilities";
import v1Router from "./api/v1/routes";
import { conditionalMiddleware } from "./utils/expressHelpers";
// import { agenda } from "./config/agenda.config";

const app = express();
const whitelist = [
  "http://localhost:3000",
  "http://localhost:3001", // NEW: Often needed for development
  process.env.FRONTEND_URL // NEW: Use environment variable
].filter(Boolean) as string[]; // NEW: Type safety filter

// NEW: Better CORS configuration
app.use(cors({
  origin: whitelist,
  exposedHeaders: ["X-API-TOKEN", "X-Total-Count"], // NEW: Added for pagination
  credentials: true // NEW: If using cookies/auth
}));

// NEW: MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Middlewares
app.use(responseUtilities);
app.use(express.json({ limit: '10mb' })); // NEW: Increased payload limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // NEW: For form data
app.use(morgan("dev"));

// NEW: Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbState: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

// API route
app.use("/api/v1", v1Router);
// app.use("/jobs", Agendash(agenda));

// Error middlewares
app.use(errorMiddlewares.errorLogger);
app.use(errorMiddlewares.errorHandler);

// 404 Handler
app.use((req, res) => {
  res.error(404, "Resource not found", "UNKNOWN_ENDPOINT");
});

export default app;