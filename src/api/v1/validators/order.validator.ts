/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

// Define the validation schema for creating an order
export const createOrderValidator = (payload: any) => {
  const schema = z.object({
    amount: z.object({
      subTotal: z.number({ required_error: "subTotal is required." }),
      vat: z.number({ required_error: "vat is required." }),
      delivery: z.number({ required_error: "delivery is required." }),
      totalAmount: z.number({ required_error: "totalAmount is required." }),
    }),
    paymentStatus: z.enum(["Pending", "Failed", "Success"], {
      required_error: "paymentStatus is required.",
    }),
    paymentMethod: z.enum(["Paystack"], {
      required_error: "paymentMethod is required.",
    }),
    paymentType: z.enum(["Pay Now", "Pay Later"], {
      required_error: "paymentType is required.",
    }),
    orderItem: z.array(
      z.object({
        orderType: z.enum(["Media", "Print"], {
          required_error: "orderType is required.",
        }),
        mediaId: z.string().optional(),
        // printId: z.string().optional(),
        quantity: z.number().optional(),
        route: z.string().optional(),
        price: z.number({ required_error: "price is required." }),
        subtotal: z.number({ required_error: "subtotal is required." }),
        duration: z.object({
          startDate: z.string({ required_error: "startDate is required." }),
          endDate: z.string({ required_error: "endDate is required." }),
          totalDuration: z.number({
            required_error: "totalDuration is required.",
          }),
        }),
      })
    ),
  });

  return validateRequestBody(schema, payload);
};

// Define the validation schema for updating an order
export const updateOrderValidator = (payload: any) => {
  const schema = z.object({
    paymentStatus: z.enum(["Pending", "Failed", "Success"], {
      required_error: "payment Status is required.",
    }),
  });
  return validateRequestBody(schema, payload);
};

// Define the validation schema for updating the status of an order
export const updateOrderStatusValidator = (payload: any) => {
  const schema = z.object({
    orderStatus: z.enum(
      [
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
      {
        required_error: "orderStatus is required.",
      }
    ),
  });

  return validateRequestBody(schema, payload);
};
