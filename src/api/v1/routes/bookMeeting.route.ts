import express from "express";
import bookingController from "../controllers/bookMeeting.controller";
import { auth } from "../../middlewares/authMiddleware";

const bookingRouter = express.Router();

// Get all bookings route
bookingRouter.get(
  "/",
  auth({ accountType: ["admin", "user"] }),
  bookingController.getBookings
);

// Get a specific booking by ID
bookingRouter.get(
  "/:meetingId",
  auth({ accountType: ["admin", "user"] }),
  bookingController.getBookingById
);

// Create a new booking route
bookingRouter.post(
  "/create",
  auth({ accountType: ["admin", "user"] }),
  bookingController.createBooking
);

// Update a booking by ID route
bookingRouter.patch(
  "/update/:meetingId",
  auth({ accountType: ["admin", "user"] }),
  bookingController.updateBooking
);

// Delete a booking by ID route
bookingRouter.delete(
  "/delete/:meetingId",
  auth({ accountType: ["admin", "user"] }),
  bookingController.deleteBookingById
);

export default bookingRouter;
