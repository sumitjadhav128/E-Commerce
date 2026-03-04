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
    const {
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 6
    } = req.query;

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

    // ↕ SORT
    if (sort === "low") query = query.sort({ price: 1 });
    if (sort === "high") query = query.sort({ price: -1 });

    // 📄 PAGINATION LOGIC
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Product.countDocuments(filter);

    const products = await query
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error(err);
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

// Added Review Route

router.post("/:id/review", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🚫 Prevent duplicate review
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,   // must exist in JWT
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);

    // ⭐ Recalculate average rating
    product.averageRating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.json({ message: "Review added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;