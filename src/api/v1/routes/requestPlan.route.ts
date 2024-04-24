import express from "express";
import controller from "../controllers/requestPlan.controller";
import { auth } from "../../middlewares/authMiddleware";

const requestPlanRouter = express.Router();

// Create a new request plan (requires admin access)
requestPlanRouter.post(
  "/create",
  auth({ accountType: ["user"] }),
  controller.createRequestPlan
);

// Update an existing request plan (requires admin access)
requestPlanRouter.patch(
  "/update/:requestId",
  auth({ accountType: ["user"] }),
  controller.updateRequestPlan
);

// Get all request plans (requires user access)
requestPlanRouter.get(
  "/",
  auth({ accountType: ["user"] }),
  controller.getRequestPlans
);

// Get a specific request plan by ID (requires user access)
requestPlanRouter.get(
  "/:requestId",
  auth({ accountType: ["user"] }),
  controller.getRequestPlanById
);

// Delete a request plan by ID (requires admin access)
requestPlanRouter.delete(
  "/delete/:requestId",
  auth({ accountType: ["admin"] }),
  controller.deleteRequestPlanById
);

export default requestPlanRouter;
