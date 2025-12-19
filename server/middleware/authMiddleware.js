const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // Expect: "Authorization: Bearer <token>"
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header." });
    }

    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request for later use
    req.user = {
      id: payload.sub,
      role: payload.role,
      username: payload.username,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: invalid or expired token." });
  }
};

module.exports = requireAuth;
