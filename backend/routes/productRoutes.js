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
       image: req.file
          ? {
              url: req.file.path,
              public_id: req.file.filename
            }
          : null
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
  try {
    const { search, minPrice, maxPrice, sort } = req.query;

    let filter = {};

    // 🔍 SEARCH
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // 💰 PRICE FILTER
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    // 📊 SORTING
    if (sort === "low") {
      query = query.sort({ price: 1 });
    } else if (sort === "high") {
      query = query.sort({ price: -1 });
    }

    const products = await query;

    res.json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
// const cloudinary = require("../config/cloudinary"); this is wrong 
 const {cloudinary} = require("../config/cloudinary");

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // 🔥 DELETE IMAGE FROM CLOUDINARY
      // if (product.image?.public_id) {
      //   await cloudinary.uploader.destroy(product.image.public_id);
      // }

      // 🔥 SAFE DELETE LOGIC
      if (
        product.image &&
        typeof product.image === "object" &&
        product.image.public_id
      ) {
        // console.log(cloudinary);
        await cloudinary.uploader.destroy(product.image.public_id);
      }

      await product.deleteOne();
     
      res.json({ message: "Product and image deleted successfully" });
    

    } catch (err) {
      console.log(err)
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;