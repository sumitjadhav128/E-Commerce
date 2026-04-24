
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const User = require("./models/User");
const adminRoutes = require("./routes/adminRoutes");
const authMiddleware = require("./middleware/authMiddleware");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// for login, signup
const cors = require("cors");
app.use(cors({
  origin: "*",
}));




// Routes

// User Routes
app.use("/api/auth", authRoutes);

// Product Routes
app.use("/api/products", productRoutes);

// Cart Routes
app.use("/api/cart", cartRoutes);

// Order Routes
app.use("/api/order", orderRoutes);

//Admin Routes
app.use("/api/admin", adminRoutes);

// MongoDB connection
console.log("ENV MONGO_URL:", process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

app.get("/find", authMiddleware, async (req, res) => {
  try {
    const Find = await User.find({})
  res.send(Find);
  } catch (e){
    res.status(500).send(e)
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Running on port ${port}`);
});
