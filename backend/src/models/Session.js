import mongoose from "mongoose";

const { Schema } = mongoose;

// Session Schema
const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }, // JWT expiry
  },
  { timestamps: true }
);

// Export Session Model
export default mongoose.model("Session", SessionSchema);