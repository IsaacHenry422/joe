/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

//  Define the validating schema for creating print prototype
export const createPrintPrototype = (payload: any) => {
  const schema = z.object({
    name: z.string({
      required_error: "name is required.",
    }),
    description: z.string({
      required_error: "Product Description is required.",
    })
  });
  return validateRequestBody(schema, payload);
};

//  Define the validating schema for updating print prototype
export const updatePrintPrototype = (payload: any) => {
  const schema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  });
  return validateRequestBody(schema, payload);
};

// Define the validation schema for creating a PrintMediaApplication
export const createPrintMediaApplicationValidator = (payload: any) => {
  const schema = z.object({
    name: z.string({
      required_error: "name is required.",
    }),
    description: z.string({
      required_error: "Product Description is required.",
    }),
    prototype: z.string({
      required_error: "Product prototype is required.",
    }),
    price: z.string({
      required_error: "Product price is required.",
    }),
    features: z.string().array().optional(),
  });
  return validateRequestBody(schema, payload);
};

// Define the validation schema for updating a PrintMediaApplication
export const updatePrintMediaApplicationValidator = (payload: any) => {
  const schema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    prototype: z.string().optional(),
    price: z.string().optional(),
    features: z.string().array().optional(),
  });

  return validateRequestBody(schema, payload);
};
