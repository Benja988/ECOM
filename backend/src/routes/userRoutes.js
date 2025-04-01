import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  changeUserRole,
  deleteUser,
  suspendUser,
} from "../controllers/userController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Public & Authenticated User Routes
router.get("/:id", authenticateUser, getUserById);
router.patch("/profile", authenticateUser, updateUserProfile);

// ✅ Admin-only Routes
router.get("/", authenticateUser, authorizeRoles("ADMIN"), getAllUsers);
router.patch("/change-role", authenticateUser, authorizeRoles("ADMIN"), changeUserRole);
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), deleteUser);
router.patch("/suspend", authenticateUser, authorizeRoles("ADMIN"), suspendUser);
router.patch("/unsuspend", authenticateUser, authorizeRoles("ADMIN"), suspendUser); // Reuse with reverse action

export default router;
