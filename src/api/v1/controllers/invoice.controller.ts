import { Request, Response } from "express";
import {
  ResourceNotFound,
  ServerError,
  BadRequest,
} from "../../../errors/httpErrors";
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
import * as validators from "../validators/invoice.validator";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

class InvoiceController {
  async createInvoice(req: Request, res: Response) {
    const userId = req.loggedInAccount._id;

    // Create the invoice
    const { error, data } = validators.createInvoiceValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const {
      customerName,
      customerMail,
      phoneNumber,
      mediaType,
      state,
      BRTtypes,
      period,
      quantity,
      unitPrice,
      tax,
      dueDate,
      invoiceNote,
    } = data;

    // Calculate total based on unitPrice and quantity
    const calculateTotal = unitPrice * quantity;

    // Create the invoice
    const invoice = new Invoice({
      userId,
      customerName,
      customerMail,
      phoneNumber,
      mediaType,
      state,
      BRTtypes,
      period,
      quantity,
      unitPrice,
      total: calculateTotal,
      tax,
      dueDate,
      invoiceNote,
    });

    // Save the order
    const savedOrder = await invoice.save();

    // Prepare payload for payment service
    const email = customerMail;
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
    await invoiceNotification({ email: customerMail, link: response });

    res.created({
      invoice: savedOrder,
      authorizationurl: response,
      messageLink: "Invoice payment link created.",
      messageInvoice:
        "Invoice created successfully, pay within 1-3 hours to avoid order being cancelled.",
    });
  }

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
