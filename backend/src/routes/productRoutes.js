import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductRating,
} from "../controllers/productController.js";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes (Anyone can view products)
router.get("/", getAllProducts); // Get all products with optional filters
router.get("/:id", getProductById); // Get product by ID

// Seller or Admin Routes (Create, Update, Delete)
router.post("/", authenticateUser, authorizeRoles("SELLER", "ADMIN"), createProduct); // Create new product
router.patch("/:id", authenticateUser, authorizeRoles("SELLER", "ADMIN"), updateProduct); // Update product
router.delete("/:id", authenticateUser, authorizeRoles("SELLER", "ADMIN"), deleteProduct); // Delete product

// Authenticated Users - Add rating for a product
router.post("/rating", authenticateUser, addProductRating); // Add or update product rating

export default router;
