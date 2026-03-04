const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  
  name: String,
  description: String,
  price: Number,
  image: {
  url: String,
  public_id: String
},
  stock: Number,

  reviews: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name: String,
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
],

averageRating: {
  type: Number,
  default: 0
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);