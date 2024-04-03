/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const createInvoiceValidator = (payload: any) => {
  const schema = z.object({
    customerName: z.string({ required_error: "customerName is required." }),
    customerMail: z.string({ required_error: "customerMail is required." }),
    phoneNumber: z.string({ required_error: "phoneNumber is required." }),
    mediaType: z.enum(
      ["Static", "Led Billboard", "BRT Buses", "Lampost Billboard"],
      {
        required_error: "mediaType is required.",
      }
    ),
    state: z.string({ required_error: "state is required." }),
    BRTtypes: z.string().optional(),
    period: z.string({ required_error: "period is required." }),
    quantity: z.number({ required_error: "quantity is required." }),
    unitPrice: z.number({ required_error: "unitPrice is required." }),
    tax: z.string({ required_error: "tax is required." }),
    dueDate: z.string({ required_error: "dueDate is required." }),
    paymentStatus: z
      .enum(["Pending", "Failed", "Success"], {
        required_error: "paymentStatus is required.",
      })
      .optional(),
    invoiceNote: z.string({ required_error: "invoiceNote is required." }),
    deletedAt: z.boolean().optional(),
  });

  return validateRequestBody(schema, payload);
};
