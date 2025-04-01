import mongoose from "mongoose";

const { Schema } = mongoose;

// Audit Log Schema
const AuditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // Nullable for system logs
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed }, // Stores extra info (e.g., IP address, request details)
  },
  { timestamps: true }
);

// Export Audit Log Model
export default mongoose.model("AuditLog", AuditLogSchema);