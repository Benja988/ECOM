import Product from "../models/Product.js";
import User from "../models/User.js";

// ✅ Create a new product (Seller-only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, images, category, brand } = req.body;
    const seller = req.user.id;

    // Check if all required fields are provided
    if (!name || !description || !price || !stock || !images || !category || !brand) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create the product
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      images,
      category,
      brand,
      seller,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};

// ✅ Get all products (with optional filters)
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isPublished } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({ totalProducts, products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// ✅ Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// ✅ Update a product (Seller and Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, images, category, brand, isPublished } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ensure the user is the seller of the product or an admin
    if (product.seller.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: You do not have permission to update this product" });
    }

    // Update the product
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.images = images || product.images;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

// ✅ Delete a product (Seller and Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ensure the user is the seller of the product or an admin
    if (product.seller.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: You do not have permission to delete this product" });
    }

    await product.remove();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// ✅ Add a product rating (Authenticated users)
export const addProductRating = async (req, res) => {
  try {
    const { productId, rating, review } = req.body;
    const user = req.user.id;

    // Validate the rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if the user has already rated the product
    const existingRating = product.ratings.find((r) => r.user.toString() === user);
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      product.ratings.push({ user, rating, review });
    }

    await product.save();

    res.status(200).json({ message: "Rating added successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error adding rating", error });
  }
};

export default {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductRating,
};
