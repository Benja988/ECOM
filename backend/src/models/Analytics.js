import mongoose from "mongoose";

const { Schema } = mongoose;

// Analytics Type Enum
const AnalyticsType = {
  SALES: "sales",
  USER_ACTIVITY: "user_activity",
  REVENUE: "revenue",
  TRAFFIC: "traffic",
};

// Analytics Schema
const AnalyticsSchema = new Schema(
  {
    type: { type: String, enum: Object.values(AnalyticsType), required: true },
    data: { type: Schema.Types.Mixed, required: true }, // Flexible structure for different analytics
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Export Analytics Model
export default mongoose.model("Analytics", AnalyticsSchema);