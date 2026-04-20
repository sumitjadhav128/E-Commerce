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
// Revenue check middleware
router.get("/analytics", authMiddleware, async (req, res) => {
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

// Advanced Revenue check middleware
router.get("/advanced-analytics", authMiddleware, async (req, res) => {
  try {

    // 📈 Revenue per day
    const revenuePerDay = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 📊 Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 👥 New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // 📦 Top selling products

    // this shows Id's of the product
    // const topProducts = await Order.aggregate([
    //   { $unwind: "$items" },
    //   {
    //     $group: {
    //       _id: "$items.product",
    //       totalSold: { $sum: "$items.quantity" }
    //     }
    //   },
    //   { $sort: { totalSold: -1 } },
    //   { $limit: 5 }
    // ]);

    // This shows names of the product
    const topProducts = await Order.aggregate([
  { $unwind: "$items" },

  {
    $group: {
      _id: "$items.product",
      totalSold: { $sum: "$items.quantity" }
    }
  },

  { $sort: { totalSold: -1 } },

  { $limit: 5 },

  // 🔗 Join with Product collection
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "productInfo"
    }
  },

  { $unwind: "$productInfo" },

  {
    $project: {
      _id: 0,
      name: "$productInfo.name",
      totalSold: 1
    }
  }
]);

    res.json({
      revenuePerDay,
      monthlyRevenue,
      newUsers,
      topProducts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;