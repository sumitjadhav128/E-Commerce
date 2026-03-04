require("dotenv").config();
const express = require("express");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");


const router = express.Router();

//Product Admin Only
router.post(
  "/add",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log(req.file)
      const { name, price, stock, description } = req.body;

      const product = new Product({
        name,
        price,
        stock,
        description,
        image: req.file ? req.file.path : null
      });
      console.log(product)
      await product.save();

      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// get all products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// get single products
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

//UPDATE Product Route
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedProduct);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Delete Product Route
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;