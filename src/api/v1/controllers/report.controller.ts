import { Request, Response } from "express";

import Order from "../../../db/models/order.model";
import Transaction from "../../../db/models/transaction.model";

import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";

// import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
  orderStatus?: string;
  paymentStatus?: string;

  status?: string;
  transactionType?: string;
  paymentMethod?: string;
};

// Define PipelineStage type
// type PipelineStage = object; // Adjust this according to Mongoose types if needed

class ReportController {
  async orderReport(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);
    const orderStatus = queryParams.orderStatus;
    const paymentStatus = queryParams.paymentStatus;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const totalOrders = await Order.countDocuments(query);

    res.ok({ totalOrders }, { page, limit, startDate, endDate });
  }

  async transactionReport(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);
    const transactionType = queryParams.transactionType;
    const status = queryParams.status;
    const paymentMethod = queryParams.paymentMethod;

    // Construct the query object based on the provided parameters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (transactionType) {
      query.transactionType = transactionType;
    }

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    const transactions = await Transaction.find(query);

    const totalTransactions = await Transaction.countDocuments(query);

    let totalTransactionsAmount = 0;
    transactions.map((transaction) => {
      totalTransactionsAmount += transaction.amount;
    });

    res.ok(
      { totalTransactionsAmount, totalTransactions },
      { page, limit, startDate, endDate }
    );
  }

  async getUserStatistics(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    const totalAdSpace = await Order.aggregate([
      { $match: { userId: userId } },
      {
        $group: { _id: null, totalAdSpace: { $sum: { $size: "$orderItem" } } },
      },
    ]);

    const totalSpentAggregate = await Order.aggregate([
      { $match: { userId: userId, paymentStatus: "Success" } },
      { $unwind: "$orderItem" },
      { $group: { _id: null, totalSpent: { $sum: "$orderItem.price" } } },
    ]);

    const totalOngoing = await Order.countDocuments({
      userId: userId,
      orderStatus: "In progress",
    });

    const totalPending = await Order.countDocuments({
      userId: userId,
      orderStatus: "Pending",
    });

    res.ok({
      totalAdSpace: totalAdSpace.length > 0 ? totalAdSpace[0].totalAdSpace : 0,
      totalSpent:
        totalSpentAggregate.length > 0 ? totalSpentAggregate[0].totalSpent : 0,
      totalOngoing,
      totalPending,
    });
  }
}

export default new ReportController();
