import mongoose, { Document, Model, Schema } from "mongoose";

type MediaType = "BRT Buses" | "LED Billboard" | "Lampost";

type PaymentStatus = "Pending" | "Paid";

export interface Invoice extends Document {
  userId: mongoose.Types.ObjectId;
  customerName: string;
  customerMail: string;
  phoneNumber: string;
  mediaType: MediaType;
  state: string;
  BRTtypes?: string;
  period: string;
  quantity: number;
  unitPrice: string;
  total: string;
  tax: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  invoiceNote: string;
  deletedAt?: Date | null;
}

const InvoiceSchema: Schema<Invoice> = new Schema<Invoice>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user schema
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerMail: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["BRT Buses", "LED Billboard", "Lampost"],
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    BRTtypes: {
      type: String,
    },
    period: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: String,
      required: true,
    },
    total: {
      type: String,
      required: true,
    },
    tax: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
      required: true,
    },
    invoiceNote: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const InvoiceModel: Model<Invoice> = mongoose.model<Invoice>(
  "Invoice",
  InvoiceSchema
);

export default InvoiceModel;
