const JournalEntry = require("../models/JournalEntry");

exports.createEntry = async (req, res) => {
  try {
    const { mood, entryText } = req.body;
    if (!mood || !entryText?.trim()) {
      return res.status(400).json({ message: "mood and entryText are required." });
    }

    const doc = await JournalEntry.create({
      userId: req.user.id,
      mood,
      entryText: entryText.trim(),
    });

    return res.status(201).json({ message: "Entry created.", entry: doc });
  } catch (err) {
    console.error("CREATE_JOURNAL_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.getMyEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: entries.length,
      entries: entries.map((e) => ({
        id: String(e._id),
        mood: e.mood,
        entryText: e.entryText,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    });
  } catch (err) {
    console.error("GET_JOURNAL_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { mood, entryText } = req.body;

    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.id });
    if (!entry) return res.status(404).json({ message: "Entry not found." });

    if (mood) entry.mood = mood;
    if (typeof entryText === "string") entry.entryText = entryText.trim();

    await entry.save();
    return res.status(200).json({ message: "Entry updated." });
  } catch (err) {
    console.error("UPDATE_JOURNAL_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const deleted = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Entry not found." });

    return res.status(200).json({ message: "Entry deleted." });
  } catch (err) {
    console.error("DELETE_JOURNAL_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
