import { Request, Response } from "express";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();
import Order from "../../../db/models/order.model";
import Transaction from "../../../db/models/transaction.model";
import Invoice from "../../../db/models/invoice.model";
import User from "../../../db/models/user.model";
import Notification from "./notification.controller";
import {
  newTransactionNotification,
  successOrderNotification,
  successInvoiceNotification,
} from "../../../services/email.service";

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
    const { savedOrder, paymentType, savedInvoice } = data.metadata;

    // Ignore transaction if it has already been logged
    const transaction = await Transaction.findOne({
      transactionCustomId: data.reference,
    });

    if (transaction) return res.sendStatus(200);

    if (paymentType === "Order") {
      // Update the payment status of the corresponding order
      const order = await Order.findById(savedOrder._id);
      if (order) {
        order.paymentStatus = "Success";
        order.orderItem.forEach((item) => {
          if (item.orderType === "Billboard") {
            item.orderStatus = "Awaiting Confirmation";
          } else if (item.orderType === "Print") {
            item.orderStatus = "Awaiting Shipment";
          }
        });
        await order.save();
      }

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

      //notification payload
      const notificationPayload = {
        userId: savedOrder.userId,
        title: "New Transaction",
        content: `Transaction: ${transaction.transactionCustomId} for Order: ${savedOrder.orderCustomId} payment was successful`,
        activityType: "Transaction",
        orderId: savedOrder._id,
        transactionId: transaction._id,
      };
      await Notification.createNotification(notificationPayload);

      const user = await User.findById(savedOrder.userId);
      // Format the createdAt date
      const formattedDate = transaction.createdAt
        ?.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })
        .replace(",", "");

      //send email to user (Order and Transaction)

      // Send successful transaction email notification
      await newTransactionNotification(
        user!.email,
        user!.firstname,
        user!.lastname,
        transaction.amount,
        formattedDate! // Use formatted date
      );

      // Send successful order email notification
      await successOrderNotification(
        savedOrder.orderCustomId,
        user!.email,
        user!.firstname,
        formattedDate!, // Use formatted date
        savedOrder.amount.subTotal,
        savedOrder.amount.vat,
        savedOrder.amount.delivery,
        savedOrder.amount.totalAmount,
        transaction.paymentMethod,
        transaction.paymentComment
      );

      //TODO: update the next availability in media(billboard)
    } else if (paymentType === "Invoice") {
      //perform Invoice here
      // Update the payment status of the corresponding order
      await Invoice.updateOne(
        { _id: savedInvoice._id }, // Update Invoice, not Order
        {
          paymentStatus: "Success",
          // orderStatus: "Awaiting Confirmation",
        }
      );

      // Create a new transaction record
      const newInvoiceTransaction = new Transaction({
        adminCustomId: savedInvoice.adminCustomId,
        invoiceId: savedInvoice._id,
        transactionCustomId: data.reference,
        transactionType: paymentType,
        amount: data.amount / 100,
        status: "Success",
        paymentMethod: "Paystack",
        paymentComment: `Using - (${data.authorization.brand})${data.authorization.channel} ****${data.authorization.last4}`,
      });

      // Send invoice successful email notification
      await successInvoiceNotification({
        email: savedInvoice.customerMail,
        name: savedInvoice.customerName,
        invoiceCustomId: savedInvoice.invoiceCustomId,
        createdAt: new Date(),
        mediaType: savedInvoice.mediaType,
        BRTtypes: savedInvoice.BRTtypes!,
        dueDate: savedInvoice.dueDate,
        quantity: savedInvoice.quantity,
        unitPrice: savedInvoice.unitPrice,
        tax: savedInvoice.tax,
        total: savedInvoice.total,
        paymentStatus: savedInvoice.paymentStatus,
      });

      // Save the transaction record to the database
      await newInvoiceTransaction.save();
    } else {
      res.sendStatus(200);
    }

    res.sendStatus(200);
  }
}

export default new WebhookController();
