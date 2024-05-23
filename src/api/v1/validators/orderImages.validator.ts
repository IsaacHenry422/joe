/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const createOrderImageValidator = (payload: any) => {
  const schema = z.object({
    orderId: z.string({ required_error: "Name is required." }),
    image: z.string({ required_error: "Phone number is required." }),
    userId: z.string({ required_error: "Email is required." }),
  });

  return validateRequestBody(schema, payload);
};

