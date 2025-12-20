const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const { getRoomMessages } = require("../controllers/roomController");

const router = express.Router();

// Protected history endpoint
router.get("/:roomId/messages", requireAuth, getRoomMessages);

module.exports = router;
