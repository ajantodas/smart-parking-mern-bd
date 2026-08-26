const express = require("express");
const Slot = require("../models/Slot");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET /api/slots  -> public, live slot map
router.get("/", async (req, res) => {
  try {
    const slots = await Slot.find().sort({ slotId: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

// POST /api/slots/reset-all  -> admin only, mark everything empty
router.post("/reset-all", protect, adminOnly, async (req, res) => {
  try {
    await Slot.updateMany({}, { status: "empty", currentBooking: null });
    const slots = await Slot.find().sort({ slotId: 1 });
    req.app.get("io").emit("slotsUpdate", slots);
    res.json({ message: "সব স্লট খালি করা হয়েছে", slots });
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

module.exports = router;
