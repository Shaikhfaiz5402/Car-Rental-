import express from "express";
import {
  getVehicles,
  getBikes,       // import this controller
  getHelmets,     // import this controller
  getUserData,
  loginUser,
  registerUser
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserData);
userRouter.get('/cars', getVehicles);
userRouter.get('/bikes', getBikes);        // add this
userRouter.get('/helmets', getHelmets);    // add this

export default userRouter;
