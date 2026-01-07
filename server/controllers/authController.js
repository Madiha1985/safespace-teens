const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, age, interests } = req.body;

    if (!username || !email || !password || age === undefined || age === null) {
      return res.status(400).json({ message: "username, email, password, and age are required." });
    }
    const ageNum = Number(age);

   if (!Number.isInteger(ageNum) || ageNum < 12 || ageNum > 17) {
   return res.status(400).json({ message: "Age must be between 12 and 17." });
   }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existing) {
      return res.status(409).json({ message: "User with this email or username already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      age: Number(age),
      interests: Array.isArray(interests) ? interests : [],
      role: "teen",
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        age: user.age,
        interests: user.interests,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER_ERROR:", err);
    return res.status(500).json({ message: "Server error during registration." });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "emailOrUsername and password are required." });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        age: user.age,
        interests: user.interests,
        role: user.role,
        avatarUrl: user.avatarUrl || ""

      },
    });
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
};
