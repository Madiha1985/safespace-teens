const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const {
  createEntry,
  getMyEntries,
  updateEntry,
  deleteEntry,
} = require("../controllers/journalController");

const router = express.Router();

router.get("/", requireAuth, getMyEntries);
router.post("/", requireAuth, createEntry);
router.put("/:id", requireAuth, updateEntry);
router.delete("/:id", requireAuth, deleteEntry);

module.exports = router;
