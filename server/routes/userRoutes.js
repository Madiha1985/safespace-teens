const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getMe, updateInterests,updateAvatar } = require("../controllers/userController");

const router = express.Router();

// Protected route
router.get("/me", requireAuth, getMe);
router.put("/me/interests", requireAuth, updateInterests);
router.patch("/avatar", requireAuth, updateAvatar);



module.exports = router;
