import mongoose from "mongoose";

const { Schema } = mongoose;

// Notification Types Enum
const NotificationType = {
  ORDER_UPDATE: "order_update",
  PROMOTION: "promotion",
  SYSTEM_ALERT: "system_alert",
};

// Notification Schema
const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Export the Notification Model
export default mongoose.model("Notification", NotificationSchema);