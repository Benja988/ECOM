import User, { UserRole } from "../models/User.js";

// ✅ Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ✅ Update user profile (User can update their own profile)
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// ✅ Change user role (Admin only)
export const changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error("Error changing role:", error.message);
    res.status(500).json({ message: "Error changing role" });
  }
};

// ✅ Soft delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDeleted = true;
    await user.save();

    res.status(200).json({ message: "User soft deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// ✅ Get all users (Paginated + Filters)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isVerified } = req.query;
    const filter = { isDeleted: false }; // Exclude soft-deleted users

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";

    const users = await User.find(filter)
      .select("-password")
      .skip((Number(page) - 1) * (Number(limit) || 10))
      .limit(Number(limit) || 10);

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({ totalUsers, users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// ✅ Suspend User (Admin only)
export const suspendUser = async (req, res) => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userId, reason } = req.body;
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isSuspended = true;
    user.suspensionReason = reason;
    await user.save();

    res.status(200).json({ message: "User suspended successfully", user });
  } catch (error) {
    console.error("Error suspending user:", error.message);
    res.status(500).json({ message: "Error suspending user" });
  }
};
