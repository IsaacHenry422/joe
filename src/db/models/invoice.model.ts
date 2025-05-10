 // src/db/models/invoice.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface InvoiceItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice extends Document {
  orderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  invoiceCustomId?: string; // Added invoiceCustomId
  invoiceDate: Date;
  dueDate?: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentDate?: Date;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' }, // Assuming you have a Product model
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const InvoiceSchema: Schema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, required: true, ref: 'Order', unique: true }, // Link to the order
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, // Link to the customer
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceCustomId: { type: String, unique: true },  // Added invoiceCustomId
    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, min: 0 },
    taxAmount: { type: Number, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDate: { type: Date },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    billingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    notes: { type: String },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const InvoiceModel = mongoose.model<Invoice>('Invoice', InvoiceSchema);

export default InvoiceModel;