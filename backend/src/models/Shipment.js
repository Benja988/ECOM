import mongoose from "mongoose";

const { Schema } = mongoose;

// Shipment Status Enum
const ShipmentStatus = {
  PENDING: "pending",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELED: "canceled",
};

// Shipment Schema
const ShipmentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    trackingNumber: { type: String, unique: true, sparse: true, index: true },
    carrier: { type: String, required: true },
    status: { type: String, enum: Object.values(ShipmentStatus), default: ShipmentStatus.PENDING },
    estimatedDelivery: { type: Date },
    shippingAddress: { type: String, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    shippingMethod: { type: String, required: true },
  },
  { timestamps: true }
);

// Export the Shipment Model
export default mongoose.model("Shipment", ShipmentSchema);