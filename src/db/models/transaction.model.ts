import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransaction extends Document {
  userId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  transactionCustomId: string;
  transactionType: "Order" | "Invoice";
  amount: number;
  status: "Pending" | "Success" | "Failed";
  paymentMethod: "Paystack";
  paymentComment: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //transaction can either be order or invoice
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    transactionCustomId: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["Order", "Invoice"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Paystack"],
      required: true,
    },
    paymentComment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const TransactionModel: Model<ITransaction> = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default TransactionModel;
