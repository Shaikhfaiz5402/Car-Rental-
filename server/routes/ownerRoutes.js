import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

import {
  addCar,
  getOwnerCars,
  toggleCarAvailability,
  deleteCar,
  addBike,
  getOwnerBikes,
  toggleBikeAvailability,
  deleteBike,
  addHelmet,
  getOwnerHelmets,
  toggleHelmetAvailability,
  deleteHelmet,
  changeRoleToOwner,
  getDashboardData,
  updateUserImage,
} from "../controllers/ownerController.js";

const ownerRouter = express.Router();

// Change user role to Owner
ownerRouter.post("/change-role", protect, changeRoleToOwner);

// --- Cars Routes ---
ownerRouter.post("/add-car", protect, upload.single("image"), addCar);
ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.patch("/toggle-car", protect, toggleCarAvailability);
ownerRouter.delete("/delete-car/:id", protect, deleteCar); // Use route param for deletion

// --- Bikes Routes ---
ownerRouter.post("/add-bike", protect, upload.single("image"), addBike);
ownerRouter.get("/bikes", protect, getOwnerBikes);
ownerRouter.patch("/toggle-bike", protect, toggleBikeAvailability);
ownerRouter.delete("/delete-bike/:id", protect, deleteBike);

// --- Helmets Routes ---
ownerRouter.post("/add-helmet", protect, upload.single("image"), addHelmet);
ownerRouter.get("/helmets", protect, getOwnerHelmets);
ownerRouter.patch("/toggle-helmet", protect, toggleHelmetAvailability);
ownerRouter.delete("/delete-helmet/:id", protect, deleteHelmet);

// Dashboard Data
ownerRouter.get("/dashboard", protect, getDashboardData);

// Update User Profile Image
ownerRouter.post("/update-image", protect, upload.single("image"), updateUserImage);

export default ownerRouter;
