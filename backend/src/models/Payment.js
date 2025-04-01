import mongoose from "mongoose";

const { Schema } = mongoose;

// Payment Status Enum
const PaymentStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// Payment Method Enum
const PaymentMethod = {
  CREDIT_CARD: "credit_card",
  PAYPAL: "paypal",
  BANK_TRANSFER: "bank_transfer",
  CRYPTO: "crypto",
};

// Payment Schema
const PaymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    transactionId: { type: String, unique: true, sparse: true }, // Optional transaction ID from external payment provider
  },
  { timestamps: true }
);

// Export the Payment Model
export default mongoose.model("Payment", PaymentSchema);