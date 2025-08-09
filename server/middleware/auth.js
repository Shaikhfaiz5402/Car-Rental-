import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = typeof payload === 'string' ? payload : payload.id || payload._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};