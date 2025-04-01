import mongoose from "mongoose";

const { Schema } = mongoose;

// Wishlist Schema
const WishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // One wishlist per user
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }], // Array of product IDs
  },
  { timestamps: true }
);

// Export the Wishlist Model
export default mongoose.model("Wishlist", WishlistSchema);