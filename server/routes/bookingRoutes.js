import express from "express";
import { 
  changeBookingStatus, 
  checkAvailabilityOfVehicle, 
  createBooking, 
  getOwnerBookings, 
  getUserBookings 
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

// Check availability of any vehicle type (car, bike, helmet)
bookingRouter.post('/check-availability', checkAvailabilityOfVehicle);

// Create booking for any vehicle type
bookingRouter.post('/create', protect, createBooking);

// Get bookings for logged-in user (any vehicle type)
bookingRouter.get('/user', protect, getUserBookings);

// Get bookings for vehicles owned by logged-in owner (any vehicle type)
bookingRouter.get('/owner', protect, getOwnerBookings);

// Change booking status (pending, confirmed, cancelled)
bookingRouter.post('/change-status', protect, changeBookingStatus);

export default bookingRouter;
