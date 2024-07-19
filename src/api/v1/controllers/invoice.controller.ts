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

//import { invoiceNotification } from "../../../services/email.service";
import * as validators from "../validators/invoice.validator";
import Admin from "../../../db/models/admin.model";
import GeneratorService from "../../../utils/customIdGeneratorHelpers";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

class InvoiceController {
  async createInvoice(req: Request, res: Response) {
    const adminId = req.loggedInAccount._id;

    console.log(adminId);

    // Fetch adminCustomId from Admin model using adminId
    const adminData = await Admin.findById(adminId);
    if (!adminData) {
      throw new ResourceNotFound("Admin not found", "RESOURCE_NOT_FOUND");
    }
    const { adminCustomId } = adminData;

    // Validate request body using a validator function
    const { error, data } = validators.createInvoiceValidator(req.body);
    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const invoiceCustomId = await GeneratorService.generateInvoiceCustomId();

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

    // Calculate total based on unitPrice, quantity, and tax
    const subtotal = unitPrice * quantity * period;
    const taxAmount = subtotal * (tax / 100);
    const calculateTotal = subtotal + taxAmount;

    // Create the invoice
    const invoice = new Invoice({
      adminCustomId,
      customerName,
      customerMail,
      phoneNumber,
      mediaType,
      state,
      invoiceCustomId,
      BRTtypes,
      period,
      quantity,
      unitPrice,
      total: calculateTotal,
      tax,
      dueDate,
      invoiceNote,
    });

    // Save the invoice
    const savedInvoice = await invoice.save();

    // Prepare payload for payment service
    const email = customerMail;
    const amount = calculateTotal;
    const metadata = {
      paymentType: "Invoice",
      savedInvoice,
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
    // await invoiceNotification({
    //   email: customerMail,
    //   link: response,
    //   mediaType,
    //   state,
    //   BRTtypes,
    //   period,
    //   quantity,
    //   unitPrice,
    //   tax,
    //   dueDate,
    // });

    res.created({
      invoice: savedInvoice,
      authorizationurl: response,
      messageLink: "Invoice payment link created.",
      messageInvoice:
        "Invoice created successfully, pay within 1-3 hours to avoid order being cancelled.",
    });
  }

  // Update an invoice by ID
  async updateInvoice(req: Request, res: Response) {
    const { invoiceId } = req.params;

    const { error, data } = validators.updateInvoiceValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, data, {
      new: true,
    });
    if (!updatedInvoice) {
      throw new ResourceNotFound(
        `Invoice with ID ${invoiceId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }
    res.ok({ updatedInvoice, messageInvoice: "successfully updated" });
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

  async getInvoiceByCustomId(req: Request, res: Response) {
    const { customId } = req.params;
    if (!customId) {
      throw new ResourceNotFound(
        "invoiceCustomId is missing.",
        "RESOURCE_NOT_FOUND"
      );
    }

    const invoice = await Invoice.findOne({ invoiceCustomId: customId }).select(
      invoiceField.join(" ")
    );
    if (!invoice) {
      throw new ResourceNotFound(
        `Invoice with ID ${customId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(invoice);
  }
}

export default new InvoiceController();
