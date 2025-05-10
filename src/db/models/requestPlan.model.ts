import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Define the interface for the Order model
export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  payment: PaymentInfo;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount?: number;
  total: number;
  notes?: string;
}

interface OrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber?: string;
}

interface PaymentInfo {
  method: PaymentMethod;
  transactionId?: string;
  status: PaymentStatus;
  amountPaid: number;
  paymentDate?: Date;
}

type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

type PaymentMethod = 
  | 'credit_card'
  | 'paypal'
  | 'bank_transfer'
  | 'cash_on_delivery';

type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

// Define the schema for the Order model
const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
      },
      variant: {
        name: String,
        value: String
      }
    }],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'Nigeria' },
      postalCode: { type: String, required: true },
      phoneNumber: String
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      phoneNumber: String
    },
    payment: {
      method: {
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
        required: true
      },
      transactionId: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      amountPaid: {
        type: Number,
        required: true,
        min: [0, 'Amount paid cannot be negative']
      },
      paymentDate: Date
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative']
    },
    shippingCost: {
      type: Number,
      required: true,
      min: [0, 'Shipping cost cannot be negative']
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    notes: String
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'payment.status': 1 });

// Virtual for formatted order date
OrderSchema.virtual('formattedDate').get(function(this: IOrder) {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Pre-save hook to calculate totals
OrderSchema.pre<IOrder>('save', function(next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.tax + this.shippingCost - (this.discount || 0);
  }
  next();
});

const OrderModel: Model<IOrder> = mongoose.model<IOrder>(
  "Order",
  OrderSchema
);

export default OrderModel;