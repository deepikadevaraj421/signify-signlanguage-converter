const express = require("express");
const { saveGesture, getHistory } = require("../controllers/gestureController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/save", protect, saveGesture);
router.get("/history", protect, getHistory);

module.exports = router;
