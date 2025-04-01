import mongoose from "mongoose";

const { Schema } = mongoose;

// Category Schema
const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // SEO-friendly URL
    description: { type: String, trim: true },
    image: { type: String }, // Image URL for category branding
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", required: false }, // Parent category reference
  },
  { timestamps: true }
);

// Export the Category Model
export default mongoose.model("Category", CategorySchema);