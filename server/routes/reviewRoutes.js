const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const {
  createReview,
  getReviews,
  getReviewById,
  addComment,
} = require("../controllers/reviewController");

const router = express.Router();

router.get("/", requireAuth, getReviews);
router.post("/", requireAuth, createReview);
router.get("/:id", requireAuth, getReviewById);
router.post("/:id/comments", requireAuth, addComment);

module.exports = router;
