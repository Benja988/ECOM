import mongoose from "mongoose";

const { Schema } = mongoose;

// Cart Schema
const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // One cart per user
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalPrice: { type: Number, required: true, min: 0, default: 0 }, // Calculated total price
  },
  { timestamps: true }
);

// Export the Cart Model
export default mongoose.model("Cart", CartSchema);