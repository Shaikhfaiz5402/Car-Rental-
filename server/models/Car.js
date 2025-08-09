import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    pricePerDay: { type: Number, required: true },
    category: { type: String },
    transmission: { type: String },
    fuel_type: { type: String },
    seating_capacity: { type: Number },
    location: { type: String },
    description: { type: String },
    isAvailable: { type: Boolean, default: true },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.models.Car || mongoose.model('Car', carSchema);
export default Car;
