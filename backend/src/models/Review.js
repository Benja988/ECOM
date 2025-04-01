import mongoose from "mongoose";

const { Schema } = mongoose;

// Review Schema
const ReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // 1 to 5 stars
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

// Export the Review Model
export default mongoose.model("Review", ReviewSchema);