import mongoose, { Document, Model, Schema } from "mongoose";

type MediaType = "BRT Buses" | "LED Billboard" | "Lampost";

export interface Invoice extends Document {
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
  invoiceNote: string;
  deletedAt?: Date | null;
}

const InvoiceSchema: Schema<Invoice> = new Schema<Invoice>(
  {
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
    invoiceNote: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const InvoiceModel: Model<Invoice> = mongoose.model<Invoice>("Invoice", InvoiceSchema);

export default InvoiceModel;
