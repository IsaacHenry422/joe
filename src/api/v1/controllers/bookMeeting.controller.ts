import { Request, Response } from "express";
import { BadRequest, ResourceNotFound } from "../../../errors/httpErrors";
import BookMeeting from "../../../db/models/bookMeeting.model";
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

class BookMeetingController {
  async createBooking(req: Request, res: Response) {
    const { error, data } = validators.createBookingValidator(req.body);
    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const newBooking = await BookMeeting.create(data);

    res.created({
      booking: newBooking,
      message: "Meeting successfully booked.",
    });
  }

  async updateBooking(req: Request, res: Response) {
    const { meetingId } = req.params;

    const { error, data } = validators.updateBookingValidator(req.body);
    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const updatedBooking = await BookMeeting.findByIdAndUpdate(
      meetingId,
      data,
      {
        new: true,
      }
    );
    if (!updatedBooking) {
      throw new ResourceNotFound(
        `Meeting with ID ${meetingId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({
      updatedBooking,
      message: "Book meeting details updated successfully.",
    });
  }

  async getBookings(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const query = BookMeeting.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalBookings = BookMeeting.countDocuments(query);

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
    const { meetingId } = req.params;
    if (!meetingId) {
      throw new BadRequest("Meeting ID is missing.", "MISSING_REQUIRED_FIELD");
    }

    const booking = await BookMeeting.findById(meetingId);

    if (!booking) {
      throw new ResourceNotFound(
        `Meeting with ID ${meetingId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(booking);
  }

  async deleteBookingById(req: Request, res: Response) {
    const { meetingId } = req.params;
    if (!meetingId) {
      throw new BadRequest("Booking ID is missing.", "MISSING_REQUIRED_FIELD");
    }

    const deletedBooking = await BookMeeting.findByIdAndDelete(meetingId);
    if (!deletedBooking) {
      throw new ResourceNotFound(
        `Meeting with ID ${meetingId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.noContent();
  }
}

export default new BookMeetingController();
