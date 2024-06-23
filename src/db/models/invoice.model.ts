import mongoose, { Document, Model, Schema } from "mongoose";

type MediaType = "Static" | "Led Billboard" | "BRT Buses" | "Lampost Billboard";

type PaymentStatus = "Pending" | "Failed" | "Success";

export interface Invoice extends Document {
  adminCustomId: string;
  customerName: string;
  customerMail: string;
  invoiceCustomId: string;
  phoneNumber: string;
  mediaType: MediaType;
  state: string;
  BRTtypes?: string;
  period: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tax: number;
  dueDate: string;
  paymentStatus: PaymentStatus;
  invoiceNote: string;
  deletedAt?: Date | null;
}

const InvoiceSchema: Schema<Invoice> = new Schema<Invoice>(
  {
    adminCustomId: { type: String, required: true },
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
    invoiceCustomId: {
      type: String,
      required: true,
      unique: true,
    },
    mediaType: {
      type: String,
      enum: [
        "Static Billboard",
        "Led Billboard",
        "BRT Buses Billboard",
        "Lampost Billboard",
      ],
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
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Failed", "Success"],
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
