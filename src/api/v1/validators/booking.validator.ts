/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const createBookingValidator = (payload: any) => {
  const schema = z.object({
    name: z.string({ required_error: "Name is required." }),
    phoneNumber: z.string({ required_error: "Phone number is required." }),
    email: z.string({ required_error: "Email is required." }),
    companyName: z.string({ required_error: "Company name is required." }),
    productOfInterest: z.string({
      required_error: "Product of interest is required.",
    }),
    selectIntendedAdvertState: z.string({
      required_error: "State is required.",
    }),
    selectIntendedAdvertCity: z.string({ required_error: "City is required." }),
    budget: z.number({ required_error: "Budget is required." }).positive({
      message: "Budget must be a positive number.",
    }),
    availableTiming: z.string({
      required_error: "Available timing is required.",
    }),
    meetingMode: z.string({ required_error: "Meeting mode is required." }),
  });

  return validateRequestBody(schema, payload);
};

export const updateBookingValidator = (payload: any) => {
  const schema = z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    companyName: z.string().optional(),
    productOfInterest: z.string().optional(),
    selectIntendedAdvertState: z.string().optional(),
    selectIntendedAdvertCity: z.string().optional(),
    budget: z
      .number()
      .positive({ message: "Budget must be a positive number." })
      .optional(),
    availableTiming: z.string().optional(),
    meetingMode: z.string().optional(),
  });

  return validateRequestBody(schema, payload);
};
