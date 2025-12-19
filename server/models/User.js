const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 30, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },

    age: { type: Number, required: true, min: 12, max: 17 },
    interests: [{ type: String, trim: true }],
    avatarUrl: { type: String, default: "" },

    role: { type: String, enum: ["teen", "parent", "teacher"], default: "teen" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
