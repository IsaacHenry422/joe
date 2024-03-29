import { Request, Response } from "express";
import { ResourceNotFound } from "../../../errors/httpErrors";
import Invoice from "../../../db/models/invoice.model";
import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";
import { invoiceField } from "../../../utils/fieldHelpers";
import PaystackService from "../../../services/payment.service";

import { sendInvoiceNotification } from "../../../services/email.service";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

type CreateInvoiceBody = {
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
    const { body } = req;

    // Calculate total based on unitPrice and quantity
    const calculateTotal = Number(body.unitPrice) * Number(body.quantity);

    const newInvoiceData: CreateInvoiceBody = {
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
    const newInvoice = await Invoice.create(newInvoiceData);

    // Prepare payload for payment service
    const email = body.customerMail;
    const amount = calculateTotal;
    const metadata = {
      phoneNumber: body.phoneNumber,
      state: body.state,
    };

    // Call PaystackService to initiate payment
    const response = await PaystackService.payWithPaystack(
      email,
      amount,
      metadata
    );

    // Send invoice notification with authorization URL
    await sendInvoiceNotification(
      body.customerMail,
      body.customerName,
      response
    );

    res.created({
      newInvoice,
      authorizationurl: response,
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
