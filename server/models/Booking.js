import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // IMPORTANT: refPath uses model names ('Car' | 'Bike' | 'Helmet')
    vehicleType: { type: String, enum: ['Car', 'Bike', 'Helmet'], required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'vehicleType' },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    mobile: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
