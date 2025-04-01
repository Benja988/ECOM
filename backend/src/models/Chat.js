import mongoose from "mongoose";

const { Schema } = mongoose;

// Message Schema
const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Chat Schema
const ChatSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [MessageSchema],
  },
  { timestamps: true }
);

// Export Chat Model
export default mongoose.model("Chat", ChatSchema);