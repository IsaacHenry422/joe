import cors from "cors";
import express from "express";
import morgan from "morgan";
// import Agendash from "agendash";

import * as errorMiddlewares from "./api/middlewares/errorMiddlewares";
import responseUtilities from "./api/middlewares/responseUtilities";
import v1Router from "./api/v1/routes";
// import { agenda } from "./config/agenda.config";

const app = express();
const whitelist = [
  "http://localhost:3000",
  "https://vaadmedia.vercel.app",
  "https://vaad.com.ng",
];

// Middlewares
app.use(responseUtilities);
app.use(cors({ origin: whitelist, exposedHeaders: ["X-API-TOKEN"] }));

app.use(morgan("dev"));
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
