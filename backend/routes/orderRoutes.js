const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");


//checkout
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;

    const orderItems = cart.items.map(item => {
      total += item.product.price * item.quantity;

      return {
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      };
    });

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: total,
      status: "Pending"
    });

    await newOrder.save();

    res.json({
      message: "Order created. Proceed to payment.",
      orderId: newOrder._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get User Orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
    .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// admin get all orders
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//update order status
router.patch("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updatedOrder);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Payment Route
router.post("/pay/:orderId", authMiddleware, async (req, res) => {
  try {
    const { success } = req.body; // true or false

    const order = await Order.findById(req.params.orderId)
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!success) {
      order.status = "Cancelled";
      await order.save();
      return res.json({ message: "Payment failed. Order cancelled." });
    }

    // Payment success
    order.status = "Paid";
    await order.save();

    // Reduce stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

    res.json({ message: "Payment successful. Order completed." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;