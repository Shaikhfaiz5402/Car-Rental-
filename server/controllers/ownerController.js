import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import Bike from "../models/Bike.js";
import Helmet from "../models/helmet.js";
import User from "../models/User.js";
import fs from "fs";

// Helper to get model by category
const getVehicleModel = (category) => {
  switch(category.toLowerCase()) {
    case 'car': return Car;
    case 'bike': return Bike;
    case 'helmet': return Helmet;
    default: throw new Error('Invalid vehicle category');
  }
}

// Map UI category labels to a vehicle type (car | bike | helmet)
const getVehicleTypeFromCategory = (categoryLabel) => {
  const label = String(categoryLabel || '').trim().toLowerCase();
  const bikeLabels = ['bike', 'motorbike', 'scooter', 'bicycle', 'cycle'];
  const helmetLabels = ['helmet'];
  if (helmetLabels.includes(label)) return 'helmet';
  if (bikeLabels.includes(label)) return 'bike';
  // Default all other categories to car (e.g., sedan, suv, van, hatchback, etc.)
  return 'car';
}

// API to Change Role of User
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.json({ success: true, message: "Now you can list vehicles" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Normalize incoming vehicle payload to our schema
const normalizeVehiclePayload = (raw) => {
  const normalized = { ...raw };
  if (!normalized.pricePerDay && typeof normalized.price === 'number') {
    normalized.pricePerDay = normalized.price;
  }
  delete normalized.price;
  delete normalized.user;
  return normalized;
};

// Build an image URL that works even if URL endpoint is not configured
const buildImageUrl = (uploadResponse, folderPath) => {
  try {
    const hasUrlEndpoint = Boolean(process.env.IMAGEKIT_URL_ENDPOINT);
    if (!hasUrlEndpoint && uploadResponse?.url) {
      return uploadResponse.url; // fallback to original URL
    }
    return imagekit.url({
      path: uploadResponse.filePath,
      transformation: [
        { width: '1280' },
        { quality: 'auto' },
        { format: 'webp' }
      ]
    });
  } catch (e) {
    return uploadResponse?.url || '';
  }
};

// API to Add Car
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    let vehicleData = JSON.parse(req.body.carData);
    vehicleData = normalizeVehiclePayload(vehicleData);
    const imageFile = req.file;

    if (!vehicleData.category) {
      return res.json({ success: false, message: "Vehicle category is required" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);
    const vehicleType = getVehicleTypeFromCategory(vehicleData.category);
    const uploadFolder = vehicleType === 'helmet' ? '/helmets' : vehicleType === 'bike' ? '/bikes' : '/cars';
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: uploadFolder
    });

    const image = buildImageUrl(response, uploadFolder);
    const VehicleModel = getVehicleModel(vehicleType);

    await VehicleModel.create({ ...vehicleData, owner: _id, image });

    res.json({ success: true, message: `${vehicleData.category} Added` });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// API to Add Bike
export const addBike = async (req, res) => {
  try {
    const { _id } = req.user;
    let vehicleData = JSON.parse(req.body.bikeData);
    vehicleData = normalizeVehiclePayload(vehicleData);
    const imageFile = req.file;

    if (!vehicleData.category) {
      return res.json({ success: false, message: "Vehicle category is required" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: `/bikes`
    });

    const image = buildImageUrl(response, '/bikes');
    const VehicleModel = Bike;

    await VehicleModel.create({ ...vehicleData, owner: _id, image });

    res.json({ success: true, message: `${vehicleData.category} Added` });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// API to Add Helmet
export const addHelmet = async (req, res) => {
  try {
    const { _id } = req.user;
    let vehicleData = JSON.parse(req.body.helmetData);
    vehicleData = normalizeVehiclePayload(vehicleData);
    const imageFile = req.file;

    if (!vehicleData.category) {
      return res.json({ success: false, message: "Vehicle category is required" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: `/helmets`
    });

    const image = buildImageUrl(response, '/helmets');
    const VehicleModel = Helmet;

    await VehicleModel.create({ ...vehicleData, owner: _id, image });

    res.json({ success: true, message: `${vehicleData.category} Added` });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// API to Get Owner Vehicles (cars, bikes, helmets)
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Get Owner Bikes only
export const getOwnerBikes = async (req, res) => {
  try {
    const { _id } = req.user;
    const bikes = await Bike.find({ owner: _id });
    res.json({ success: true, bikes });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Get Owner Helmets only
export const getOwnerHelmets = async (req, res) => {
  try {
    const { _id } = req.user;
    const helmets = await Helmet.find({ owner: _id });
    res.json({ success: true, helmets });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Toggle Vehicle Availability (car, bike, helmet)
const toggleAvailabilityForModel = (Model) => async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.body;

    if (!id) {
      return res.json({ success: false, message: "Vehicle ID required" });
    }

    const vehicle = await Model.findById(id);
    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }

    if (vehicle.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    vehicle.isAvailable = !vehicle.isAvailable;
    await vehicle.save();

    res.json({ success: true, message: "Availability toggled" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const toggleCarAvailability = toggleAvailabilityForModel(Car);
export const toggleBikeAvailability = toggleAvailabilityForModel(Bike);
export const toggleHelmetAvailability = toggleAvailabilityForModel(Helmet);

// Delete Vehicle (car, bike, helmet)
const deleteVehicleForModel = (Model, successLabel) => async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.body;

    if (!id) {
      return res.json({ success: false, message: "Vehicle ID required" });
    }

    const vehicle = await Model.findById(id);
    if (!vehicle) {
      return res.json({ success: false, message: "Vehicle not found" });
    }

    if (vehicle.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    await Model.findByIdAndDelete(id);
    res.json({ success: true, message: `${successLabel} Removed` });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const deleteCar = deleteVehicleForModel(Car, 'Car');
export const deleteBike = deleteVehicleForModel(Bike, 'Bike');
export const deleteHelmet = deleteVehicleForModel(Helmet, 'Helmet');

// Get dashboard data (aggregate vehicles and bookings)
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== 'owner') {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const [cars, bikes, helmets] = await Promise.all([
      Car.find({ owner: _id }),
      Bike.find({ owner: _id }),
      Helmet.find({ owner: _id }),
    ]);

    const allVehicleIds = [
      ...cars.map(c => c._id),
      ...bikes.map(b => b._id),
      ...helmets.map(h => h._id),
    ];

    const bookings = await Booking.find({ vehicle: { $in: allVehicleIds } }).populate('vehicle').sort({ createdAt: -1 });

    const pendingBookings = bookings.filter(b => b.status === "pending");
    const completedBookings = bookings.filter(b => b.status === "confirmed");

    const monthlyRevenue = completedBookings.reduce((acc, booking) => acc + booking.price, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBikes: bikes.length,
      totalHelmets: helmets.length,
      totalVehicles: cars.length + bikes.length + helmets.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    res.json({ success: true, dashboardData });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Update user profile image
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;
    const imageFile = req.file;

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: '/users'
    });

    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: '400' },
        { quality: 'auto' },
        { format: 'webp' }
      ]
    });

    const image = optimizedImageUrl;

    await User.findByIdAndUpdate(_id, { image });
    res.json({ success: true, message: "Image Updated" });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}
