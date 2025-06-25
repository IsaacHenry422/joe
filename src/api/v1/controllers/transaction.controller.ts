 
 import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import Transaction from "../../../db/models/transaction.model";
import User from "../../../db/models/user.model";

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

    res.ok({
      transaction,
    });
  }

  // NEW METHOD to create/complete a transaction and update seller info
  async completeTransaction(req: Request, res: Response) {
    try {
      const { sellerId, ...transactionData } = req.body;

      if (!sellerId) {
        throw new BadRequest("sellerId is required", "MISSING_REQUIRED_FIELD");
      }

      // Create and save the transaction
      const transaction = new Transaction({
        ...transactionData,
        sellerId,
      });
      await transaction.save();

      // Update seller's sales count and premium status
      const seller = await User.findById(sellerId);

      if (seller && seller.accountType === "Seller") {
        if (!seller.sellerInfo) {
          seller.sellerInfo = {
            isPremium: false,
            premiumType: null,
            salesCount: 0,
          };
        }

        seller.sellerInfo.salesCount += 1;

        if (
          !seller.sellerInfo.isPremium &&
          seller.sellerInfo.salesCount >= 6
        ) {
          // Example: mark seller as premium or restrict selling
          // seller.sellerInfo.isPremium = true;
          // seller.sellerInfo.canSell = false;

          // TODO: add notification logic here if needed
        }

        await seller.save();
      }

      // Return the created transaction
      res.ok({ transaction });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: String(error) });
      }
    }
  }
}

export default new transactionController();
