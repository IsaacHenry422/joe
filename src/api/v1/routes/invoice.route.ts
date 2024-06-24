import express from "express";
import controller from "../controllers/invoice.controller";
import { auth } from "../../middlewares/authMiddleware";

const invoiceRouter = express.Router();

// Get all invoices route
invoiceRouter.get(
  "/all",
  auth({ accountType: ["admin"] }),
  controller.getInvoices
);

// Get a specific invoice by ID route
invoiceRouter.get(
  "/:invoiceId",
  auth({ accountType: ["admin"] }),
  controller.getInvoiceById
);
// Get a specific invoice by custom ID route
invoiceRouter.get(
  "/custom/:customId",
  auth({ accountType: ["admin"] }),
  controller.getInvoiceByCustomId
);

// Create a new invoice route
invoiceRouter.post(
  "/create",
  auth({ accountType: ["admin"] }),
  controller.createInvoice
);

// Update an invoice by ID route
invoiceRouter.patch(
  "/:invoiceId",
  auth({ accountType: ["admin"] }),
  controller.updateInvoice
);

export default invoiceRouter;
