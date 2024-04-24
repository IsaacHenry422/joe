import { Request, Response } from "express";
import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import Booking from "../../../db/models/booking.model";
import * as validators from "../validators/booking.validator";
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

class BookingController {
  async createBooking(req: Request, res: Response) {
    const { error, data } = validators.createBookingValidator(req.body);
    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const newBooking = await Booking.create(data);

    res.created({
      booking: newBooking,
      message: "Booking created successfully.",
    });
  }

  async updateBooking(req: Request, res: Response) {
    const { bookingId } = req.params;

    const { error, data } = validators.updateBookingValidator(req.body);
    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, data, {
      new: true,
    });
    if (!updatedBooking) {
      throw new ResourceNotFound(
        `Booking with ID ${bookingId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({
      updatedBooking,
      message: "Booking updated successfully.",
    });
  }

  async getBookings(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const query = Booking.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalBookings = Booking.countDocuments(query);

    const [bookings, totalCount] = await Promise.all([
      query.exec(),
      totalBookings.exec(),
    ]);

    res.ok(
      { total: totalCount, bookings },
      { page, limit, startDate, endDate }
    );
  }

  async getBookingById(req: Request, res: Response) {
    const { bookingId } = req.params;
    if (!bookingId) {
      throw new BadRequest("Booking ID is missing.", "MISSING_REQUIRED_FIELD");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new ResourceNotFound(
        `Booking with ID ${bookingId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(booking);
  }

  async deleteBookingById(req: Request, res: Response) {
    const { bookingId } = req.params;
    if (!bookingId) {
      throw new BadRequest("Booking ID is missing.", "MISSING_REQUIRED_FIELD");
    }

    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    if (!deletedBooking) {
      throw new ResourceNotFound(
        `Booking with ID ${bookingId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.noContent();
  }
}

export default new BookingController();
