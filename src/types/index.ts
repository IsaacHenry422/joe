 /* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { HttpErrorCode } from "../errors/httpErrors";
import { envSchema } from "../env";
import { IUser } from "../db/models/user.model";
import { IAdmin } from "../db/models/admin.model";
import { IProduct } from "../db/models/product"; // NEW
import { ICategory } from "../db/models/category.model"; // NEW

declare global {
  namespace Express {
    export interface Response {
      // Standard response methods
      ok(payload: any, meta?: any): Response;
      created(payload: any): Response;
      noContent(): Response;
      error(
        statusCode: number,
        message: string,
        errorCode: HttpErrorCode
      ): Response;
      
      // NEW: Typed response methods
      paginated<T>(
        data: T[],
        total: number,
        meta?: Record<string, any>
      ): Response;
    }

    export interface Request {
      // Authentication
      user?: { id: number; email: string };
      loggedInAccount: IUser | IAdmin;
      
      // NEW: Commerce-related properties
      product?: IProduct; // For product middleware
      category?: ICategory; // For category middleware
      validatedData?: {
        product?: Partial<IProduct>;
        category?: Partial<ICategory>;
      };
    }

    // NEW: Typed request interfaces
    export interface ProductRequest extends Request {
      product: IProduct;
    }
    
    export interface CategoryRequest extends Request {
      category: ICategory;
    }
  }

  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {
      // NEW: Commerce-specific environment variables
      PRODUCT_IMAGE_BASE_URL?: string;
      INVENTORY_WARNING_THRESHOLD?: string;
    }
  }

  // NEW: Global types for API responses
  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
      code: HttpErrorCode;
      message: string;
      details?: any;
    };
    meta?: {
      pagination?: {
        total: number;
        page: number;
        limit: number;
      };
      [key: string]: any;
    };
  }
}