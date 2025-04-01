import mongoose from "mongoose";

const { Schema } = mongoose;

// Product Schema
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    images: { type: [String], required: true }, // Array of image URLs
    category: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Linked to User (Seller)
    isPublished: { type: Boolean, default: false }, // Product visibility control
    ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        review: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

// Export the Product Model
export default mongoose.model("Product", ProductSchema);