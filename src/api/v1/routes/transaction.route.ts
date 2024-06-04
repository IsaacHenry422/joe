import express from "express";
import transactionController from "../controllers/transaction.controller";
import { auth } from "../../middlewares/authMiddleware";

const transactionRouter = express.Router();

// admin get all transactions
transactionRouter.get(
  "/admin",
  auth({ accountType: ["admin"] }),
  transactionController.getAllTransactions
);

// admin get user's transactions
transactionRouter.get(
  "/admin/user",
  auth({ accountType: ["admin"] }),
  transactionController.getUserTransactions
);

// admin get a transaction by id
transactionRouter.get(
  "/admin/one",
  auth({ accountType: ["admin"] }),
  transactionController.getAtransactionById
);

// user get all transactions
transactionRouter.get(
  "/",
  auth({ accountType: ["user"] }),
  transactionController.getUserTransactions
);

// user get a transaction by id
transactionRouter.get(
  "/one",
  auth({ accountType: ["user"] }),
  transactionController.getAtransactionById
);

//status
transactionRouter.get(
  "/status",
  transactionController.getAtransactionByCustomId
);

export default transactionRouter;
