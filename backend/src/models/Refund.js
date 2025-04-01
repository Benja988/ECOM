import mongoose from "mongoose";

const { Schema } = mongoose;

// Refund Status Enum
const RefundStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PROCESSED: "processed",
};

// Refund Schema
const RefundSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: Object.values(RefundStatus), default: RefundStatus.PENDING },
    amount: { type: Number, required: true },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

// Export Refund Model
export default mongoose.model("Refund", RefundSchema);