import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectDB from "./db";
import "./env";
import { startJobs } from "./config/agenda.config";

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

const port = process.env.PORT || "8080";
app.listen(port, async () => {
  console.log(`Listening for requests on port ${port} ...`);
  await connectDB();
  console.log("Successfully connected to mongodb");
  await startJobs();
  console.log("Agenda started successfully");
});
