import User, { UserRole } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Joi from "joi";
import { sendEmail } from "../utils/sendEmail.js";
import { validateUserRegistration } from "../middlewares/validateMiddleware.js";
import { requestLogger } from "../middlewares/loggerMiddleware.js";
import mongoose from "mongoose";

// Generate JWT Token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token valid for 7 days
    );
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

// ✅ Admin Registration (Requires ADMIN_SECRET from .env)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    console.log("Email check:", email);

    // Check for Admin Secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid admin secret key" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create a new admin user (do not hash the password manually)
    const newAdmin = new User({
      name,
      email,
      password, // Directly use the plain password
      role: UserRole.ADMIN,
      isVerified: true,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Register Customer (Normal Flow with Email Verification)

export const registerCustomer = [
  // Log the request (requestLogger) and validate input (validateUserRegistration) would go here

  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if email already exists
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Create new customer user
      const newUser = new User({
        name,
        email,
        password,
        role: "CUSTOMER",
        isVerified: false,
        verificationToken, // Store the token in the user model
      });

      // Save the user
      await newUser.save();

      // Construct the verification link
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;

      // Send email with verification link
      await sendEmail(email, "Verify Your Email", `Click here: ${verificationLink}`);

      // Send response to user
      res.status(201).json({ message: "Customer registered. Please verify your email." });
    } catch (error) {
      console.error("Error registering customer:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  },
];

// ✅ Register Seller (Requires Admin Approval)
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newSeller = new User({
      name,
      email,
      password,
      role: "SELLER",
      isVerified: false,
      verificationToken,
      isApproved: false, // Admin must approve
      businessName,
    });

    await newSeller.save();
    await sendEmail(email, "Seller Registration", "Your account is pending admin approval.");

    res.status(201).json({ message: "Seller registered. Awaiting admin approval." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    // Check if the token and email are provided
    if (!token || !email) {
      return res.status(400).json({ message: "Invalid or missing verification token or email" });
    }

    console.log("Token received:", token); // Debugging to ensure token is present
    console.log("Email received:", email); // Debugging to ensure email is present

    // Find the user by email and the verification token
    const user = await User.findOne({ email, verificationToken: token });

    // Check if user exists and token matches
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Token is valid, now verify and update the user's status
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token after successful verification
    await user.save();

    // Respond with success message
    return res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error);
    // General error handling
    return res.status(500).json({ message: error.message || "Internal server error during email verification" });
  }
};

// ✅ Admin Approves Seller
export const approveSeller = async (req, res) => {
  try {
    const { user } = req;
    
    // Check if the user is logged in and is an admin
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user data" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized: Admins only" });
    }

    // Accessing the sellerId from query parameters
    const { sellerId } = req.query;
    console.log("Seller ID from query:", sellerId); // Debugging
    console.log("Is Valid ObjectId:", mongoose.Types.ObjectId.isValid(sellerId)); // Debugging

    // Validate the seller ID format
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid Seller ID format" });
    }

    // Convert sellerId to ObjectId explicitly
    const objectId = new mongoose.Types.ObjectId(sellerId);

    // Find the seller by ID
    const seller = await User.findById(objectId);
    if (!seller || seller.role !== "SELLER") {
      return res.status(404).json({ message: "Seller not found or role is not SELLER" });
    }

    // Mark the seller as approved
    seller.isApproved = true;

    // Generate a verification token valid for 14 days
    const verificationToken = jwt.sign(
      { id: seller._id, role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: "14d" }
    );

    // Save the verification token to the user document
    seller.verificationToken = verificationToken;
    await seller.save();

    // Generate the verification link
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

    // Send the verification email
    try {
      await sendEmail(
        seller.email,
        "Account Approved",
        `Your seller account has been approved. Please verify your account within 14 days by clicking the following link: ${verificationLink}`
      );
      console.log(`Verification email sent to ${seller.email}`);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return res.status(500).json({ message: "Error sending verification email" });
    }

    // Respond with success message
    res.json({ message: "Seller approved and verification email sent (if email service works)." });
  } catch (error) {
    console.error("Error approving seller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Login
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Normalize email
    email = email.trim().toLowerCase();

    // Find the user (include password for verification)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if the email is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Verify your email before logging in" });
    }

    // Check if the user is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        message: "Your account has been suspended. Contact support.",
        reason: user.suspensionReason || "Policy violation",
      });
    }

    // Check if the seller account is approved
    if (user.role === UserRole.SELLER && !user.isApproved) {
      return res.status(403).json({ message: "Seller account is pending approval" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if the email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token and expiration time
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiration time
    await user.save();

    // Send reset email with the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(email, "Reset Your Password", `Click here to reset your password: ${resetLink}`);

    // Respond with a success message
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Reset Password
export const resetPassword = async (req, res) => {
  // Validate input
  const schema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
      .required()
      .messages({
        "string.pattern.base": "Password must include uppercase, lowercase, number, and special character.",
      }),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { token, newPassword } = value;

  try {
    // Find user by reset token and ensure token is not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token has not expired
    });

    if (!user) {
      console.warn("Invalid or expired reset token attempt", { token });
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Respond with success message
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error during password reset", { error });
    res.status(500).json({ message: "Internal server error" });
  }
};