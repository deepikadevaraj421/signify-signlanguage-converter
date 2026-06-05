const Gesture = require("../models/Gesture");

const saveGesture = async (req, res) => {
  try {
    const { gesture, confidence } = req.body;
    const userId = req.user.id;

    const newGesture = await Gesture.create({
      userId,
      gesture,
      confidence,
    });

    res.status(201).json({ message: "Gesture saved", data: newGesture });
  } catch (err) {
    console.error("Save gesture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const gestures = await Gesture.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json(gestures);
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { saveGesture, getHistory };
