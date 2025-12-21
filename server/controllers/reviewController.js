const Review = require("../models/Review");

exports.createReview = async (req, res) => {
  try {
    const { bookTitle, genre, rating, reviewText } = req.body;

    if (!bookTitle || !rating || !reviewText) {
      return res.status(400).json({ message: "bookTitle, rating, and reviewText are required." });
    }

    const doc = await Review.create({
      userId: req.user.id,
      username: req.user.username,
      bookTitle,
      genre: genre || "",
      rating,
      reviewText,
    });

    return res.status(201).json({ message: "Review created.", review: doc });
  } catch (err) {
    console.error("CREATE_REVIEW_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .select("_id username bookTitle genre rating reviewText createdAt comments")
      .lean();

    return res.status(200).json({
      count: reviews.length,
      reviews: reviews.map((r) => ({
        id: String(r._id),
        username: r.username,
        bookTitle: r.bookTitle,
        genre: r.genre,
        rating: r.rating,
        reviewText: r.reviewText,
        commentsCount: r.comments?.length ?? 0,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET_REVIEWS_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).lean();
    if (!review) return res.status(404).json({ message: "Review not found." });

    return res.status(200).json({
      review: {
        id: String(review._id),
        userId: review.userId,
        username: review.username,
        bookTitle: review.bookTitle,
        genre: review.genre,
        rating: review.rating,
        reviewText: review.reviewText,
        comments: (review.comments || []).map((c) => ({
          id: String(c._id),
          userId: c.userId,
          username: c.username,
          text: c.text,
          createdAt: c.createdAt,
        })),
        createdAt: review.createdAt,
      },
    });
  } catch (err) {
    console.error("GET_REVIEW_BY_ID_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Comment text is required." });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found." });

    review.comments.push({
      userId: req.user.id,
      username: req.user.username,
      text: text.trim(),
    });

    await review.save();

    return res.status(201).json({ message: "Comment added." });
  } catch (err) {
    console.error("ADD_COMMENT_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
