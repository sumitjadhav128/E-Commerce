const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add Product to Cart

router.post("/add/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ product: productId });
    }

    await cart.save();

    res.json({ message: "Product added to cart", cart });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// view cart

router.get("/", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product");

  res.json(cart);
});

// update Product quantity

router.patch("/update/:productId", authMiddleware, async (req, res) => {
  try {
    const { action } = req.body;
    const userId = req.user.id;
    const productId = req.params.productId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      i => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (action === "increase") {
      item.quantity += 1;
    }

    if (action === "decrease") {
      item.quantity -= 1;

      if (item.quantity <= 0) {
        cart.items = cart.items.filter(
          i => i.product.toString() !== productId
        );
      }
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId })
      .populate("items.product");

    res.json(updatedCart);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// remove Item quantity

router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId })
      .populate("items.product");

    res.json(updatedCart);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;