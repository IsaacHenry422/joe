// import dotenv from "dotenv";
// dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` }); // NEW: Environment-specific config

// import app from "./app";
// import connectDB from "./db";
// import "./env";
// import { startJobs } from "./config/agenda.config";
// import { setupInitialData } from "../scripts/setupCategories.ts"; // NEW: Optional initial data setup
// import mongoose from 'mongoose'; // NEW: Import mongoose

// // Increase Node.js heap memory limit
// import v8 from "v8";
// v8.setFlagsFromString("--max-old-space-size=8192");

// // NEW: Configuration validation
// if (!process.env.MONGODB_URI) {
//   console.error("Missing MONGODB_URI in environment variables");
//   process.exit(1);
// }

// // NEW: Server status tracking
// let isShuttingDown = false;
// let server: any; // If you use server for shutdown

// async function gracefulShutdown() {
//   if (isShuttingDown) return;
//   isShuttingDown = true;
//   console.log("🛑 Gracefully shutting down...");
//   if (server) {
//     server.close(() => {
//       console.log("🔴 Server closed");
//       mongoose.connection.close(() => {
//         console.log("🔴 MongoDB connection closed");
//         process.exit(0);
//       });
//     });
//   } else {
//     process.exit(0);
//   }
// }

// process.on("uncaughtException", (err) => {
//   console.error("Uncaught Exception:", err);
//   if (!isShuttingDown) {
//     process.exit(1);
//   }
// });

// process.on("unhandledRejection", (err) => {
//   console.error("Unhandled Rejection:", err);
//   if (!isShuttingDown) {
//     process.exit(1);
//   }
// });

// // NEW: Graceful shutdown handler
// process.on('SIGTERM', gracefulShutdown);
// process.on('SIGINT', gracefulShutdown);

// const port = parseInt(process.env.PORT || "8080", 10);

// async function startServer() {
//   try {
//     // Connect to DB
//     await connectDB();
//     console.log("✅ Successfully connected to MongoDB");
    
//     // NEW: Optional initial data setup
//     if (process.env.SETUP_INITIAL_DATA === 'true') {
//       await setupInitialData();
//       console.log("✅ Initial data setup completed");
//     }
    
//     // Start Agenda jobs
//     await startJobs();
//     console.log("✅ Agenda started successfully");
    
//     // Start server
//     server = app.listen(port, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${port}`);
//       console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
//     });

//     // NEW: Keep-alive timeout configuration
//     server.keepAliveTimeout = 60000; // 60 seconds
//     server.headersTimeout = 65000; // 65 seconds

//   } catch (error) {
//     console.error("❌ Failed to start server:", error);
//     process.exit(1);
//   }
// }
// startServer();
 import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectDB from "./db";
import "./env";
import { startJobs } from "./config/agenda.config";

// Increase Node.js heap memory limit
import v8 from "v8";
v8.setFlagsFromString("--max-old-space-size=8192");

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

const port = parseInt(process.env.PORT || "8080", 10);  // Convert to number

async function startServer() {
  try {
    // First connect to DB
    await connectDB();
    console.log("Successfully connected to MongoDB");
    
    // Then start Agenda jobs
    await startJobs();
    console.log("Agenda started successfully");
    
    // Only then start the server
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
    
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();