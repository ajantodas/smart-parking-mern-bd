const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
    slotId: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ["car", "suv", "bike", "truck"],
      default: "car",
    },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    faceVerified: { type: Boolean, default: false },
    durationHours: { type: Number, required: true },
    rate: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "upay", "card", "cash"],
      required: true,
    },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
