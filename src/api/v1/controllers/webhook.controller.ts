import { Request, Response } from "express";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();
import Order from "../../../db/models/order.model";
import Transaction from "../../../db/models/transaction.model";

const secret = process.env.PAYSTACK_SECRET;

class WebhookController {
  //function to verify Webhook Signature
  async paystackWebhook(req: Request, res: Response) {
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    // Validate webhook origin
    if (hash != req.headers["x-paystack-signature"]) return res.sendStatus(200);

    // Only handle charge success events
    if (req.body.event !== "charge.success") return res.sendStatus(200);

    const { data } = req.body;
    const { savedOrder, paymentType } = data.metadata;

    // Ignore transaction if it has already been logged
    const transaction = await Transaction.findOne({
      transactionCustomId: data.reference,
    });

    if (transaction) return res.sendStatus(200);

    if (paymentType === "Order") {
      // Update the payment status of the corresponding order
      await Order.updateOne(
        { _id: savedOrder._id },
        {
          paymentStatus: "Success",
          orderStatus: "Awaiting Confirmation",
        }
      );

      // Create a new transaction record
      const transaction = new Transaction({
        userId: savedOrder.userId,
        orderId: savedOrder._id,
        transactionCustomId: data.reference,
        transactionType: paymentType,
        amount: data.amount / 100,
        status: "Success",
        paymentMethod: "Paystack",
        paymentComment: `Using - (${data.authorization.brand})${data.authorization.channel} ****${data.authorization.last4}`,
      });

      // Save the transaction record to the database
      await transaction.save();
    } else if (paymentType === "Invoice") {
      //perform Invoice here
    } else {
      res.sendStatus(200);
    }

    res.sendStatus(200);
  }
}

export default new WebhookController();
