const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

// Admin check middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

router.get("/analytics", authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 💰 Total Revenue (only paid orders)
    const revenueOrders = await Order.find({
  status: { $in: ["Paid", "Shipped", "Delivered"] }
});

const totalRevenue = revenueOrders.reduce(
  (acc, order) => acc + order.totalAmount,
  0
);

const paidCount = await Order.countDocuments({
  status: { $in: ["Paid", "Shipped", "Delivered"] }
});

const pendingCount = await Order.countDocuments({
  status: "Pending"
});

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      paidOrders: paidCount,
      pendingOrders: pendingCount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;