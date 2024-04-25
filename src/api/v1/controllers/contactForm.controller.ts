import { Request, Response } from "express";
import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import Contact from "../../../db/models/contactForm.model";
import * as validators from "../validators/contact.validator";

import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};

class ContactController {
  async createContact(req: Request, res: Response) {
    const { error, data } = validators.createContactValidator(req.body);
    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const { name, phoneNumber, email, message } = data;

    const contact = new Contact({
      name,
      phoneNumber,
      email,
      message,
    });

    const newContact = await contact.save();

    res.created({
      contact: newContact,
      message: "Contact created successfully.",
    });
  }

  async updateContact(req: Request, res: Response) {
    const { contactId } = req.params;

    const { error, data } = validators.updateContactValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const updatedContactUsDetails = await Contact.findByIdAndUpdate(
      contactId,
      data,
      {
        new: true,
      }
    );
    if (!updatedContactUsDetails) {
      throw new ResourceNotFound(
        `Contact us with ID ${contactId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }
    res.ok({
      updatedContactUsDetails,
      message: "contact us details updated successfully.",
    });
  }
  async getContacts(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const query = await Contact.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalContacts = await Contact.countDocuments(query);

    res.ok(
      { total: totalContacts, contacts: query },
      { page, limit, startDate, endDate }
    );
  }

  async getContactById(req: Request, res: Response) {
    const { contactId } = req.params;
    if (!contactId) {
      throw new ResourceNotFound(
        "Contact ID is missing.",
        "RESOURCE_NOT_FOUND"
      );
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw new ResourceNotFound(
        `Contact with ID ${contactId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(contact);
  }

  async deleteContactById(req: Request, res: Response) {
    const { contactId } = req.params;
    if (!contactId) {
      throw new BadRequest("Contact ID is missing.", "MISSING_REQUIRED_FIELD");
    }

    const deletedContact = await Contact.findByIdAndDelete(contactId);
    if (!deletedContact) {
      throw new ResourceNotFound(
        `Contact with ID ${contactId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.noContent();
  }
}

export default new ContactController();
