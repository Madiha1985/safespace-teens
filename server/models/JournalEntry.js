const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mood: {
      type: String,
      required: true,
      enum: ["happy", "okay", "sad", "stressed", "tired", "angry"],
    },
    entryText: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
