const express = require("express");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// POST /api/bookings  -> create a booking (user must be logged in, or guest with just phone)
router.post("/", protect, async (req, res) => {
  try {
    const {
      slotId,
      vehicleNumber,
      vehicleType,
      ownerName,
      phone,
      faceVerified,
      durationHours,
      paymentMethod,
      transactionId,
    } = req.body;

    const slot = await Slot.findOne({ slotId });
    if (!slot) return res.status(404).json({ message: "স্লট খুঁজে পাওয়া যায়নি" });
    if (slot.status === "booked") {
      return res.status(400).json({ message: "এই স্লটটি ইতিমধ্যে বুক্ড" });
    }

    const rate = slot.rate;
    const total = rate * durationHours;
    const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const booking = await Booking.create({
      user: req.user.id !== "admin" ? req.user.id : undefined,
      slot: slot._id,
      slotId: slot.slotId,
      vehicleNumber,
      vehicleType,
      ownerName,
      phone,
      faceVerified: !!faceVerified,
      durationHours,
      rate,
      total,
      paymentMethod,
      transactionId,
      endTime,
    });

    slot.status = "booked";
    slot.currentBooking = booking._id;
    await slot.save();

    const slots = await Slot.find().sort({ slotId: 1 });
    req.app.get("io").emit("slotsUpdate", slots);
    req.app.get("io").emit("newBooking", booking);

    res.status(201).json({ message: "বুকিং সফল হয়েছে", booking });
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

// GET /api/bookings/my  -> logged-in user's bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

// PATCH /api/bookings/:id/cancel -> cancel booking, free the slot
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "বুকিং পাওয়া যায়নি" });

    booking.status = "cancelled";
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.status = "empty";
      slot.currentBooking = null;
      await slot.save();
    }

    const slots = await Slot.find().sort({ slotId: 1 });
    req.app.get("io").emit("slotsUpdate", slots);

    res.json({ message: "বুকিং বাতিল হয়েছে", booking });
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

// GET /api/bookings/admin/all -> admin: full booking list
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

// GET /api/bookings/admin/stats -> admin dashboard numbers
router.get("/admin/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalSlots = await Slot.countDocuments();
    const emptySlots = await Slot.countDocuments({ status: "empty" });
    const bookedSlots = await Slot.countDocuments({ status: "booked" });
    const totalBookings = await Booking.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.find({ createdAt: { $gte: todayStart } });
    const todayRevenue = todayBookings.reduce((sum, b) => sum + b.total, 0);
    const User = require("../models/User");
    const totalUsers = await User.countDocuments();

    res.json({
      totalSlots,
      emptySlots,
      bookedSlots,
      totalBookings,
      todayRevenue,
      totalUsers,
    });
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

module.exports = router;
