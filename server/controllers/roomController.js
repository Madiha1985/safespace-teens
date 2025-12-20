const Message = require("../models/Message");

// GET /api/rooms/:roomId/messages?limit=50&before=2025-12-19T16:06:02.953Z
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is required." });
    }

    const limitRaw = Number(req.query.limit ?? 50);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

    const before = req.query.before ? new Date(req.query.before) : null;
    const filter = { roomId };

    if (before && !Number.isNaN(before.getTime())) {
      // fetch older messages than "before"
      filter.createdAt = { $lt: before };
    }

    // newest first, then we reverse so client receives chronological order
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    messages.reverse();

    return res.status(200).json({
      roomId,
      count: messages.length,
      messages: messages.map((m) => ({
        id: m._id,
        roomId: m.roomId,
        userId: m.userId,
        username: m.username,
        message: m.message,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET_ROOM_MESSAGES_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
