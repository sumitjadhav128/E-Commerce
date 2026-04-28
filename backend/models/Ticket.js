// models/Ticket.js
const  mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  reply: String,
  status: {
    type: String,
    enum: ["Open", "Resolved"],
    default: "Open"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Ticket", ticketSchema);