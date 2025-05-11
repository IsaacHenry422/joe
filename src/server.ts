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