import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import Transaction from "../../../db/models/transaction.model"; // IMediaApplication,

import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";

type QueryParams = {
  transactionId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
  userId?: string;
};

class transactionController {
  async getAllTransactions(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    // Query the database with the constructed filter
    const transactions = await Transaction.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));
    const totalTransactions = await Transaction.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const totalPages = Math.ceil(totalTransactions / limit);
    // Send the response
    res.ok(
      {
        transactions,
        totalTransactions,
        totalPages,
      },
      { page, limit, startDate, endDate }
    );
  }

  async getUserTransactions(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const accountType = req.loggedInAccount.accountType;
    let userId;

    if (accountType === "Admin") {
      userId = queryParams.userId;
    } else if (accountType === "User") {
      userId = req.loggedInAccount._id;
    }
    if (!userId) {
      throw new BadRequest("please provide user id", "MISSING_REQUIRED_FIELD");
    }
    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));
    const totalTransactions = await Transaction.countDocuments({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const totalPages = Math.ceil(totalTransactions / limit);
    // Send the response
    res.ok(
      {
        transactions,
        totalTransactions,
        totalPages,
      },
      { page, limit, startDate, endDate }
    );
  }

  async getAtransactionById(req: Request, res: Response) {
    const accountType = req.loggedInAccount.accountType;
    const queryParams: QueryParams = req.query;
    const _id = queryParams.transactionId;
    let transaction;
    if (accountType === "Admin") {
      transaction = await Transaction.findOne({ _id });
    } else if (accountType === "User") {
      const userId = req.loggedInAccount._id;
      transaction = await Transaction.findOne({ _id, userId });
    }
    if (!transaction) {
      throw new ResourceNotFound(
        `No transaction with id:${_id}`,
        "RESOURCE_NOT_FOUND"
      );
    }
    // Send the response
    res.ok({
      transaction,
    });
  }
  async getAtransactionByCustomId(req: Request, res: Response) {
    const { transactionCustomId } = req.query;
    if (!transactionCustomId) {
      throw new ResourceNotFound(
        "transactionCustomId is missing.",
        "RESOURCE_NOT_FOUND"
      );
    }
    const transaction = await Transaction.findOne({ transactionCustomId });

    if (!transaction) {
      throw new ResourceNotFound(
        "Transaction not found.",
        "RESOURCE_NOT_FOUND"
      );
    }
    // Send the response
    res.ok({
      transaction,
    });
  }
}

export default new transactionController();
