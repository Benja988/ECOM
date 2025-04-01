import mongoose from "mongoose";

const { Schema } = mongoose;

// Inventory Actions Enum
const InventoryAction = {
  PURCHASED: "purchased",
  SOLD: "sold",
  RETURNED: "returned",
  DAMAGED: "damaged",
  RESTOCKED: "restocked",
};

// Inventory Schema
const InventorySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    action: { type: String, enum: Object.values(InventoryAction), required: true },
    reference: { type: Schema.Types.ObjectId, refPath: "action" }, // Links to Order, Refund, etc.
    warehouse: { type: String, trim: true }, // Optional warehouse tracking
  },
  { timestamps: true }
);

// Export Inventory Model
export default mongoose.model("Inventory", InventorySchema);