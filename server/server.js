import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import bikeRouter from "./routes/bikeRoutes.js";       // <-- new import
import helmetRouter from "./routes/helmetRoutes.js";   // <-- new import
import Bike from "./models/Bike.js";
import Car from "./models/Car.js";
import Booking from "./models/Booking.js";

// Initialize Express App
const app = express()

// Connect Database
await connectDB()

// Drop legacy unique indexes that are no longer needed (e.g., licensePlate)
const dropLegacyIndexes = async () => {
  try {
    await Bike.collection.dropIndex('licensePlate_1');
  } catch (err) {
    if (err?.codeName !== 'IndexNotFound') {
      console.log('Bike index drop error:', err.message);
    }
  }
  try {
    await Car.collection.dropIndex('licensePlate_1');
  } catch (err) {
    if (err?.codeName !== 'IndexNotFound') {
      console.log('Car index drop error:', err.message);
    }
  }
};

await dropLegacyIndexes();

// Normalize existing bookings vehicleType values to match model names
const normalizeBookingVehicleTypes = async () => {
  try {
    await Booking.updateMany({ vehicleType: 'car' }, { $set: { vehicleType: 'Car' } });
    await Booking.updateMany({ vehicleType: 'bike' }, { $set: { vehicleType: 'Bike' } });
    await Booking.updateMany({ vehicleType: 'helmet' }, { $set: { vehicleType: 'Helmet' } });
  } catch (err) {
    console.log('Booking vehicleType normalization error:', err.message);
  }
};

await normalizeBookingVehicleTypes();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send("Server is running"));

app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/bikes', bikeRouter);       // <-- new route
app.use('/api/helmets', helmetRouter);   // <-- new route

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
