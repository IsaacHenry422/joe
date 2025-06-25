//  import cors from "cors";
// import express from "express";
// import morgan from "morgan";
// import mongoose from "mongoose"; // NEW: Import mongoose
// // import Agendash from "agendash";

// import * as errorMiddlewares from "./api/middlewares/errorMiddlewares";
// import responseUtilities from "./api/middlewares/responseUtilities";
// import v1Router from "./api/v1/routes";
// import { conditionalMiddleware } from "./utils/expressHelpers";
// // import { agenda } from "./config/agenda.config";

// const app = express();
// const whitelist = [
//   "http://localhost:3000",
//   "http://localhost:3001", // NEW: Often needed for development
//   process.env.FRONTEND_URL // NEW: Use environment variable
// ].filter(Boolean) as string[]; // NEW: Type safety filter

// // NEW: Better CORS configuration
// app.use(cors({
//   origin: whitelist,
//   exposedHeaders: ["X-API-TOKEN", "X-Total-Count"], // NEW: Added for pagination
//   credentials: true // NEW: If using cookies/auth
// }));

// // NEW: MongoDB connection events
// mongoose.connection.on('connected', () => {
//   console.log('MongoDB connected');
// });
// mongoose.connection.on('error', (err) => {
//   console.error('MongoDB connection error:', err);
// });

// // Middlewares
// app.use(responseUtilities);
// app.use(express.json({ limit: '10mb' })); // NEW: Increased payload limit
// app.use(express.urlencoded({ extended: true, limit: '10mb' })); // NEW: For form data
// app.use(morgan("dev"));

// // NEW: Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'OK',
//     dbState: mongoose.connection.readyState,
//     timestamp: new Date()
//   });
// });

// // API route
// app.use("/api/v1", v1Router);
// // app.use("/jobs", Agendash(agenda));

// // Error middlewares
// app.use(errorMiddlewares.errorLogger);
// app.use(errorMiddlewares.errorHandler);

// // 404 Handler
// app.use((req, res) => {
//   res.error(404, "Resource not found", "UNKNOWN_ENDPOINT");
// });

// export default app; 
import cors from "cors";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import { config } from "dotenv";
import * as errorMiddlewares from "./api/middlewares/errorMiddlewares";
import responseUtilities from "./api/middlewares/responseUtilities";
import v1Router from "./api/v1/routes";
import landingRoutes from "./api/v1/routes/landing.route";
import categoryRoutes from "./api/v1/routes/categoryRoutes";



// Load environment variables
config({ path: `.env.${process.env.NODE_ENV || "development"}` });

// Initialize Express
const app = express();

app.use("/api/v1/landing", landingRoutes);
app.use("/api/v1/categories", categoryRoutes);

// ======================
// CORS Configuration
// ======================
// const whitelist = [
//   process.env.FRONTEND_URL,
//   "https://crownlist-staging.vercel.app",
//   ...(process.env.NODE_ENV === "development"
//     ? ["http://localhost:3000", "http://localhost:3001"]
//     : []),
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || whitelist.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error(`Origin '${origin}' not allowed by CORS`));
//       }
//     },
//     exposedHeaders: ["X-API-TOKEN", "X-Total-Count"],
//     credentials: true,
//   })
// );
app.use(cors());
// ======================
// Database Connection
// ======================
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/your-db";

mongoose
  .connect(MONGODB_URI, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

mongoose.connection.on("disconnected", () =>
  console.warn("MongoDB disconnected")
);

// ======================
// Middlewares
// ======================
app.use(responseUtilities);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// ======================
// Routes
// ======================
// Root route for health checks/probes
app.get("/", (req, res) => {
  res.status(200).json({
    status: "running",
    version: "1.0.0",
    dbStatus: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

// Health Check endpoint (more detailed)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    dbState: mongoose.connection.readyState,
    timestamp: new Date(),
  });
});

// API v1 Routes
app.use("/api/v1", v1Router);

// ======================
// Error Handling
// ======================
// Handle favicon requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Error logger
app.use(errorMiddlewares.errorLogger);

// Main error handler
app.use(errorMiddlewares.errorHandler);

// Final 404 Handler (catches all unhandled routes)
app.use((req, res) => {
  res.error(404, "Resource not found", "UNKNOWN_ENDPOINT");
});

export default app;