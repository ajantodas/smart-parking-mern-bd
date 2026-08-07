const mongoose = require("mongoose");
const dns = require("dns");

// Bangladesh এর কিছু ISP/router এর ডিফল্ট DNS দিয়ে MongoDB Atlas এর
// SRV record resolve হয় না, তাই Google DNS ব্যবহার করা হচ্ছে
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;