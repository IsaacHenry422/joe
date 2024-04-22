/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const createContactValidator = (payload: any) => {
  const schema = z.object({
    name: z.string({ required_error: "Name is required." }),
    phoneNumber: z.string({ required_error: "Phone number is required." }),
    email: z.string({ required_error: "Email is required." }),
    message: z.string({ required_error: "Message is required." }),
  });

  return validateRequestBody(schema, payload);
};

export const updateContactValidator = (payload: any) => {
  const schema = z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    message: z.string().optional(),
  });

  return validateRequestBody(schema, payload);
};
