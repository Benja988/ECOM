import mongoose from "mongoose";

const { Schema } = mongoose;

// Enum for Order Status
const OrderStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELED: "canceled",
  RETURNED: "returned",
};

// Order Schema
const OrderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    transactionId: { type: String, required: false },
    shippingAddress: { type: String, required: true, trim: true },
    orderStatus: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
  },
  { timestamps: true }
);

// Export the Order Model
export default mongoose.model("Order", OrderSchema);