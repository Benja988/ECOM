import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Import User model

// Middleware to verify JWT token
export const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and exclude password from the response
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Attach the user to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    console.error("JWT verification failed:", error); // Log the error for debugging
    return res.status(401).json({ message: "Unauthorized: Token expired or invalid" });
  }
};

// Middleware to check user role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Ensure user exists and has a role
    if (!req.user || !req.user.role) {
      return res.status(400).json({ message: "Bad request: User role missing" });
    }

    // Check if the user's role matches any of the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next(); // Proceed if role is authorized
  };
};
