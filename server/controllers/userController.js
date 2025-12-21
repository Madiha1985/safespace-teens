const User = require("../models/User");

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("GET_ME_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({ message: "interests must be an array of strings." });
    }

    // Clean interests: trim, lowercase, remove empty, remove duplicates
    const cleaned = [...new Set(
      interests
        .map((i) => String(i).trim().toLowerCase())
        .filter((i) => i.length > 0)
    )];

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { interests: cleaned },
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ message: "Interests updated.", user });
  } catch (err) {
    console.error("UPDATE_INTERESTS_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};



exports.updateAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return res.status(400).json({ message: "avatarUrl is required." });
    }

    // ✅ Allow only preset avatars (safe for teens)
    const allowed = [
      "/avatars/1.png",
      "/avatars/2.png",
      "/avatars/3.png",
      "/avatars/4.png",
      "/avatars/5.png",
      "/avatars/6.png",
      "/avatars/7.png",
      "/avatars/8.png",
    ];

    if (!allowed.includes(avatarUrl)) {
      return res.status(400).json({ message: "Invalid avatar selection." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl },
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ message: "Avatar updated.", user });
  } catch (err) {
    console.error("UPDATE_AVATAR_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
