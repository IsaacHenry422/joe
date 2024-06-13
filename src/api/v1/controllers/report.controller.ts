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
    const paymentStatus = queryParams.paymentStatus;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

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

    // Count the number of billboards in the orderItem array of the orders
    const totalAdSpace = await Order.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$orderItem" },
      { $match: { "orderItem.orderType": "Billboard" } },
      {
        $group: { _id: null, totalBillboards: { $sum: "$orderItem.quantity" } },
      },
    ]);

    // Calculate the total amount spent by adding all the totalAmount in the order model
    const totalSpentAggregate = await Order.aggregate([
      { $match: { userId: userId, paymentStatus: "Success" } },
      { $group: { _id: null, totalSpent: { $sum: "$amount.totalAmount" } } },
    ]);

    // Count orders with orderStatus "In progress" or "Out for Delivery" in orderItem
    const totalOngoing = await Order.countDocuments({
      userId: userId,
      "orderItem.orderStatus": { $in: ["In progress", "Out for Delivery"] },
    });

    // Count orders with orderStatus "Awaiting Confirmation" or "Awaiting Shipment" in orderItem
    const awaitingConfirmation = await Order.countDocuments({
      userId: userId,
      "orderItem.orderStatus": {
        $in: ["Awaiting Confirmation", "Awaiting Shipment"],
      },
    });

    res.ok({
      totalAdSpace:
        totalAdSpace.length > 0 ? totalAdSpace[0].totalBillboards : 0,
      totalSpent:
        totalSpentAggregate.length > 0 ? totalSpentAggregate[0].totalSpent : 0,
      totalOngoing,
      awaitingConfirmation,
    });
  }
}

export default new ReportController();
