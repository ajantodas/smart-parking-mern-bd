const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { id: user._id, phone: user.phone, role: user.role, fullName: user.fullName },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;
    if (!fullName || !phone || !password) {
      return res.status(400).json({ message: "সব ঘর পূরণ করুন" });
    }
    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "এই ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট আছে" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, phone, email, password: hashed });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, fullName: user.fullName, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: "ভুল ফোন নম্বর বা পাসওয়ার্ড" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "ভুল ফোন নম্বর বা পাসওয়ার্ড" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "সার্ভার এরর", error: err.message });
  }
});

// POST /api/auth/admin-login  (demo admin, env-based)
router.post("/admin-login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { id: "admin", role: "admin", fullName: "Admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ token, user: { fullName: "Admin", role: "admin" } });
  }
  res.status(401).json({ message: "ভুল অ্যাডমিন ইউজারনেম বা পাসওয়ার্ড" });
});

module.exports = router;
