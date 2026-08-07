const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "টোকেন পাওয়া যায়নি, লগইন করুন" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "টোকেন অবৈধ বা মেয়াদোত্তীর্ণ" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "অ্যাডমিন অ্যাক্সেস প্রয়োজন" });
  }
  next();
};

module.exports = { protect, adminOnly };
