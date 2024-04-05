/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

// Define the validation schema for creating a notification
export const createNotificationValidator = (payload: any) => {
  const schema = z.object({
    userId: z.any({
      required_error: "userid is required to create a notification",
    }),
    title: z.string({
      required_error: "title is required to create a notification",
    }),
    content: z.string({
      required_error: "content is required to create a notification",
    }),
    expiresIn: z.string().optional(),
    read: z.boolean({
      required_error: "read status of notification is required",
    }).default(false),
    activityType: z.enum(["Order", "Transaction", "Invoice"], {
      required_error: "notification activity type is required",
    }),
    orderId: z.any().optional(),
    transactionId: z.any().optional(),
    invoiceId: z.any().optional(),
  });
  return validateRequestBody(schema, payload);
};
