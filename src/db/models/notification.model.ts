import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  content: string;
  expiresIn?: Date;
  read: boolean;
  activityType: "Order" | "Transaction" | "Invoice";
  orderId?: mongoose.Schema.Types.ObjectId;
  transactionId?: mongoose.Schema.Types.ObjectId;
  invoiceId?: mongoose.Schema.Types.ObjectId;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    expiresIn: {
      type: Date,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    activityType:{
      type: String,
      required: true,
      enum:["Order", "Transaction", "Invoice"],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
  },
  { timestamps: true }
);

const NotificationModel: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export default NotificationModel;
