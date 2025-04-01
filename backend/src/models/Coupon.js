import mongoose from "mongoose";

const { Schema } = mongoose;

// Coupon Types Enum
const DiscountType = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
};

// Coupon Schema
const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: Object.values(DiscountType), required: true },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

// Export the Coupon Model
export default mongoose.model("Coupon", CouponSchema);