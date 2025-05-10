/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const createProductValidator = (payload: any) => {
  const schema = z.object({
    name: z.string({ required_error: "Product name is required." }),
    price: z.number({ required_error: "Price is required." }).positive({
      message: "Price must be a positive number.",
    }),
    description: z.string().optional(),
    category: z.string().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
  });

  return validateRequestBody(schema, payload);
};

export const updateProductValidator = (payload: any) => {
  const schema = z.object({
    name: z.string().optional(),
    price: z.number().positive({ message: "Price must be a positive number." }).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
  });

  return validateRequestBody(schema, payload);
};
