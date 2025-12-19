const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getMe, updateInterests } = require("../controllers/userController");

const router = express.Router();

// Protected route
router.get("/me", requireAuth, getMe);
router.put("/me/interests", requireAuth, updateInterests);


module.exports = router;
