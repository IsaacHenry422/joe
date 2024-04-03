import { Request, Response } from "express";
import { ResourceNotFound, ServerError } from "../../../errors/httpErrors";
import Invoice from "../../../db/models/invoice.model";
import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";
import { invoiceField } from "../../../utils/fieldHelpers";
import PaystackService from "../../../services/payment.service";

import { invoiceNotification } from "../../../services/email.service";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

type CreateInvoiceBody = {
  userId: string;
  customerName: string;
  customerMail: string;
  phoneNumber: string;
  mediaType: string;
  state: string;
  BRTtypes?: string;
  period: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tax: string;
  dueDate: string;
  invoiceNote: string;
};

class InvoiceController {
  async createInvoice(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;
    const { body } = req;

    // Calculate total based on unitPrice and quantity
    const calculateTotal = Number(body.unitPrice) * Number(body.quantity);

    const newInvoiceData: CreateInvoiceBody = {
      userId,
      customerName: body.customerName,
      customerMail: body.customerMail,
      phoneNumber: body.phoneNumber,
      mediaType: body.mediaType,
      state: body.state,
      BRTtypes: body.BRTtypes,
      period: body.period,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      total: calculateTotal,
      tax: body.tax,
      dueDate: body.dueDate,
      invoiceNote: body.invoiceNote,
    };

    // Create the invoice
    const savedOrder = await Invoice.create(newInvoiceData);

    // Prepare payload for payment service
    const email = body.customerMail;
    const amount = calculateTotal;
    const metadata = {
      paymentType: "Invoice",
      savedOrder,
    };

    // Call PaystackService to initiate payment
    const response = await PaystackService.payWithPaystack(
      email,
      amount,
      metadata
    );

    if (!response) {
      throw new ServerError(
        "Initiate payment failed",
        "THIRD_PARTY_API_FAILURE"
      );
    }

    // Send invoice notification with authorization URL
    await invoiceNotification({ email: body.customerMail, link: response });

    res.created({
      invoice: savedOrder,
      authorizationurl: response,
      messageLink: "Invoice payment link created.",
      messageInvoice:
        "Invoice created successfully, pay within 1-3 hours to avoid order being cancelled.",
    });
  }

  // async generatePaymentLinkForInvoicewithPaystack(req: Request, res: Response) {
  //   const email = req.loggedInAccount.email;

  //   // Extract invoice _id from request parameters
  //   const invoiceId = req.params.invoiceId;
  //   if (!invoiceId) {
  //     throw new ResourceNotFound("Invoice ID not found", "RESOURCE_NOT_FOUND");
  //   }

  //   // Retrieve invoice details from the database
  //   const invoice = await Invoice.findById(invoiceId);
  //   if (!invoice) {
  //     throw new ResourceNotFound("Invoice not found", "RESOURCE_NOT_FOUND");
  //   }

  //   if (invoice.paymentStatus === "Success") {
  //     throw new BadRequest(
  //       "Invoice has already been paid for",
  //       "INVALID_REQUEST_PARAMETERS"
  //     );
  //   }

  //   const invoicePaystack = {
  //     email,
  //     amount: invoice.total,
  //     metadata: {
  //       paymentType: "Invoice",
  //       savedInvoice: invoice,
  //     },
  //   };

  //   // Generate Paystack payment link
  //   const paymentLink = await PaystackService.payWithPaystack(
  //     invoicePaystack.email,
  //     invoicePaystack.amount,
  //     invoicePaystack.metadata
  //   );

  //   // Return the payment link to the user
  //   return res.ok({
  //     paymentLink,
  //     message: "Payment link generated successfully.",
  //   });
  // }

  // Update an invoice by ID
  async updateInvoice(req: Request, res: Response) {
    const { invoiceId } = req.params;
    const { body } = req;
    const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, body, {
      new: true,
    });
    if (!updatedInvoice) {
      throw new ResourceNotFound(
        `Invoice with ID ${invoiceId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }
    res.ok(updatedInvoice);
  }

  // Get all invoices
  async getInvoices(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const query = Invoice.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalInvoices = await Invoice.countDocuments(query);

    const invoices = await query.select(invoiceField.join(" "));

    res.ok({ invoices, totalInvoices }, { page, limit, startDate, endDate });
  }

  // Get an invoice by ID
  async getInvoiceById(req: Request, res: Response) {
    const { invoiceId } = req.params;
    if (!invoiceId) {
      throw new ResourceNotFound("invoiceId is missing.", "RESOURCE_NOT_FOUND");
    }

    const invoice = await Invoice.findById(invoiceId).select(
      invoiceField.join(" ")
    );
    if (!invoice) {
      throw new ResourceNotFound(
        `Invoice with ID ${invoiceId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(invoice);
  }
}

export default new InvoiceController();
