const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

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
      totalAmount: total
    });

    await newOrder.save();

    // Reduce stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.json({
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;