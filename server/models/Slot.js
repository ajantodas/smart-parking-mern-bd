const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    slotId: { type: String, required: true, unique: true }, // e.g. A1, B2, C3
    zone: { type: String, enum: ["A", "B", "C"], required: true },
    status: { type: String, enum: ["empty", "booked"], default: "empty" },
    rate: { type: Number, default: 50 }, // taka per hour
    currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slot", slotSchema);
