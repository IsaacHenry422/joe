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
    userId: z.string({ required_error: "userId is required." }),
    orderCustomId: z.string({ required_error: "orderCustomId is required." }),
    amount: z.object({
      subTotal: z.number({ required_error: "subTotal is required." }),
      vat: z.number({ required_error: "vat is required." }),
      delivery: z.number({ required_error: "delivery is required." }),
      totalAmount: z.number({ required_error: "totalAmount is required." }),
    }),
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
      { required_error: "orderStatus is required." }
    ),
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
        orderSubRef: z.string({ required_error: "orderSubRef is required." }),
        orderType: z.enum(["Media", "Print"], {
          required_error: "orderType is required.",
        }),
        mediaId: z.string().optional(),
        quantity: z.number().optional(),
        route: z.string({ required_error: "route is required." }),
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
