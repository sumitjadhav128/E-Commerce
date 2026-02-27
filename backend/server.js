const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
require("dotenv").config();
const User = require("./models/User");
const authMiddleware = require("./middleware/authMiddleware");




const app = express();
const port = 5000;

// Middleware
app.use(express.json());

// for login, signup
const cors = require("cors");
app.use(cors());


// Routes

// User Routes
app.use("/api/auth", authRoutes);

// Product Routes
app.use("/api/products", productRoutes);

// Cart Routes
app.use("/api/cart", cartRoutes);

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/practice")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


app.get("/find", authMiddleware, async (req, res) => {
  try {
    const Find = await User.find({})
  res.send(Find);
  } catch (e){
    res.status(500).send(e)
  }
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
