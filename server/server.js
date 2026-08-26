require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Slot = require("./models/Slot");
const Booking = require("./models/Booking");

const authRoutes = require("./routes/authRoutes");
const slotRoutes = require("./routes/slotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
  },
});
app.set("io", io);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// seed 12 slots (A1-A4, B1-B4, C1-C4) if none exist yet
const seedSlots = async () => {
  const count = await Slot.countDocuments();
  if (count === 0) {
    const zones = ["A", "B", "C"];
    const slots = [];
    zones.forEach((zone) => {
      for (let i = 1; i <= 4; i++) {
        slots.push({ slotId: `${zone}${i}`, zone, status: "empty", rate: 50 });
      }
    });
    await Slot.insertMany(slots);
    console.log("🅿️  ১২টি স্লট সিড করা হয়েছে");
  }
};

// auto-expire bookings whose endTime has passed
const autoExpireBookings = async () => {
  const now = new Date();
  const expired = await Booking.find({ status: "active", endTime: { $lte: now } });
  if (expired.length === 0) return;

  for (const booking of expired) {
    booking.status = "completed";
    await booking.save();
    await Slot.findByIdAndUpdate(booking.slot, { status: "empty", currentBooking: null });
  }
  const slots = await Slot.find().sort({ slotId: 1 });
  io.emit("slotsUpdate", slots);
};

io.on("connection", (socket) => {
  console.log("🔌 ক্লায়েন্ট সংযুক্ত হয়েছে:", socket.id);
  socket.on("disconnect", () => console.log("🔌 ক্লায়েন্ট বিচ্ছিন্ন:", socket.id));
});

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedSlots();
  setInterval(autoExpireBookings, 30 * 1000); // check every 30s
  server.listen(PORT, () => console.log(`🚀 সার্ভার চলছে http://localhost:${PORT}`));
});
