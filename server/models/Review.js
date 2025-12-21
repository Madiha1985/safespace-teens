const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 600 },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username: { type: String, required: true },
    bookTitle: { type: String, required: true, trim: true, maxlength: 120 },
    genre: { type: String, default: "", trim: true, maxlength: 40 },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewText: { type: String, required: true, trim: true, maxlength: 2000 },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
