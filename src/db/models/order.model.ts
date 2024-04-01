import mongoose, { Document, Model } from "mongoose";

// Define the interface for the order document
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderCustomId: string;
  amount: {
    subTotal: number;
    vat: number;
    delivery: number;
    totalAmount: number;
  };
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentType: string;
  orderItem: {
    orderSubRef: string;
    orderType: "Media" | "Print";
    mediaId?: mongoose.Types.ObjectId;
    // printId?: mongoose.Types.ObjectId;
    quantity?: number;
    route?: string;
    price: number;
    subtotal: number;
    duration: {
      startDate: Date;
      endDate: Date;
      totalDuration: number;
    };
    // media property to the order interface
    media?: {
      _id: mongoose.Types.ObjectId;
      mediaCustomId: string;
      listingTitle: string;
      pictures: Array<object>;
      description?: string;
      address?: string;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  // customer property to the order interface
  customer: {
    _id: mongoose.Types.ObjectId;
    userCustomId: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber?: string;
  };
}

// Define the order schema
const OrderSchema = new mongoose.Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user schema
      required: true,
    },
    orderCustomId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      subTotal: {
        type: Number,
        required: true,
      },
      vat: {
        type: Number,
        required: true,
      },
      delivery: {
        type: Number,
        required: true,
      },
      totalAmount: {
        type: Number,
        required: true,
      },
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Awaiting Confirmation",
        "In progress",
        "Completed",
        "Awaiting Shipment",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Expired",
        "Cancelled",
      ],
      required: true,
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Failed", "Success"],
      required: true,
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Paystack"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["Pay Now", "Pay Later"],
      required: true,
    },

    orderItem: [
      {
        orderSubRef: {
          type: String,
          required: true,
        },
        orderType: {
          type: String,
          required: true,
          enum: ["Media", "Print"],
        },
        mediaId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "billboardMediaApplication",
        },
        // printId: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: "printMediaApplication",
        // },
        quantity: {
          type: Number,
        },
        route: {
          type: String,
        },
        price: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
        duration: {
          startDate: {
            type: Date,
            required: true,
          },
          endDate: {
            type: Date,
            required: true,
          },
          totalDuration: {
            type: Number,
            required: true,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

// Define the order model
const OrderModel: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
