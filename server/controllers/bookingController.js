import Car from '../models/Car.js';
import Bike from '../models/Bike.js';
import Helmet from '../models/helmet.js';
import Booking from '../models/Booking.js';

// Utility to get the model based on vehicle type
const getVehicleModel = (vehicleType) => {
  switch(vehicleType) {
    case 'car': return Car;
    case 'bike': return Bike;
    case 'helmet': return Helmet;
    default: throw new Error('Invalid vehicle type');
  }
}

// Check availability of any vehicle type
export const checkAvailabilityOfVehicle = async (req, res) => {
  try {
    const { vehicleType, vehicleId, pickupDate, returnDate } = req.body;

    if (!vehicleType || !vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if vehicle exists
    const VehicleModel = getVehicleModel(vehicleType);
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    // Check if vehicle is available for given dates
    const conflictingBookings = await Booking.find({
      vehicleType,
      vehicle: vehicleId,
      $or: [
        { pickupDate: { $lte: returnDate, $gte: pickupDate } },
        { returnDate: { $lte: returnDate, $gte: pickupDate } },
        { pickupDate: { $lte: pickupDate }, returnDate: { $gte: returnDate } },
      ],
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingBookings.length > 0) {
      return res.json({ success: false, message: 'Vehicle not available for selected dates' });
    }

    return res.json({ success: true, message: 'Vehicle available for booking' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Create booking for any vehicle type
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Backward-compatible payload support
    let { vehicleType, vehicleId, pickupDate, returnDate, mobile } = req.body;
    if (!vehicleType || !vehicleId) {
      if (req.body.car) {
        vehicleType = 'car';
        vehicleId = req.body.car;
      } else if (req.body.bike) {
        vehicleType = 'bike';
        vehicleId = req.body.bike;
      } else if (req.body.helmet) {
        vehicleType = 'helmet';
        vehicleId = req.body.helmet;
      }
    }

    if (!vehicleType || !vehicleId || !pickupDate || !returnDate || !mobile) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const vt = String(vehicleType).toLowerCase();
    const VehicleModel = getVehicleModel(vt);
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    // Check availability again before booking (optional but recommended)
    const conflictingBookings = await Booking.find({
      vehicleType,
      vehicle: vehicleId,
      $or: [
        { pickupDate: { $lte: returnDate, $gte: pickupDate } },
        { returnDate: { $lte: returnDate, $gte: pickupDate } },
        { pickupDate: { $lte: pickupDate }, returnDate: { $gte: returnDate } },
      ],
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingBookings.length > 0) {
      return res.json({ success: false, message: 'Vehicle not available for selected dates' });
    }

    // Calculate price (example: pricePerDay * number of days)
    const dayMs = 1000 * 60 * 60 * 24;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid dates' });
    }
    const dayCount = Math.max(1, Math.ceil((end - start) / dayMs));
    const price = (vehicle.pricePerDay || 0) * dayCount;

    const booking = new Booking({
      user: userId,
      // refPath expects model names 'Car'|'Bike'|'Helmet'
      vehicleType: vt === 'car' ? 'Car' : vt === 'bike' ? 'Bike' : 'Helmet',
      vehicle: vehicleId,
      pickupDate,
      returnDate,
      mobile,
      price,
      status: 'pending',
    });

    await booking.save();

    return res.json({ success: true, message: 'Booking created successfully', booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Get bookings for logged-in user (any vehicle type)
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate('vehicle')
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Get bookings for vehicles owned by logged-in owner (any vehicle type)
export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Get all vehicle IDs owned by this user (cars, bikes, helmets)
    const Car = getVehicleModel('car');
    const Bike = getVehicleModel('bike');
    const Helmet = getVehicleModel('helmet');

    const [cars, bikes, helmets] = await Promise.all([
      Car.find({ owner: ownerId }, '_id'),
      Bike.find({ owner: ownerId }, '_id'),
      Helmet.find({ owner: ownerId }, '_id'),
    ]);

    const allVehicleIds = [
      ...cars.map(c => c._id),
      ...bikes.map(b => b._id),
      ...helmets.map(h => h._id),
    ];

    // Fetch bookings for any of these vehicles
    const bookings = await Booking.find({
      vehicle: { $in: allVehicleIds }
    }).populate('vehicle')
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Change booking status
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    if (!bookingId || !status) {
      return res.status(400).json({ success: false, message: 'Missing booking ID or status' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    return res.json({ success: true, message: 'Booking status updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
