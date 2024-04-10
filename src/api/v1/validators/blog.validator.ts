/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { validateRequestBody } from "../../../utils/zodHelpers";

export const createBlogValidator = (payload: any) => {
  const schema = z.object({
    blogType: z.string({ required_error: "blogType is required." }),
    blogTitle: z.string({ required_error: "blogTitle is required." }),
    blogBody: z.string({ required_error: "blogBody is required." }),
  });

  return validateRequestBody(schema, payload);
};

export const updateBlogValidator = (payload: any) => {
  const schema = z.object({
    blogType: z.string().optional(),
    blogTitle: z.string().optional(),
    blogBody: z.string().optional(),
  });

  return validateRequestBody(schema, payload);
};
