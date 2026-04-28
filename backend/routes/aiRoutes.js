// routes/aiRoutes.js
const express = require("express")
const  Ticket = require("../models/Ticket.js");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware.js");
const Product = require("../models/Product");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;

    // 🔥 Get few products for AI context
    const products = await Product.find().limit(5);

     const productList = products
  .map(p => `${p.name} (₹${p.price})`)
  .join(", ");

    // 🔥 Call Groq API
    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
         {
  role: "system",
  content: `
You are an AI support assistant for an e-commerce website.

Website Information:
- Orders are delivered within 3-5 days
- Refunds take 5-7 business days
- Users can track orders from their profile page
- Only admins can modify or cancel orders
- Coupon code WELCOME10 gives 10% discount

Available Products:
${productList}

Instructions:
- Answer clearly and briefly
- Be helpful and polite
- If user asks about products, suggest from available products
- If unsure, guide user instead of guessing
`
},
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await aiRes.json();

    const reply = data.choices?.[0]?.message?.content || "No response";

    // 🔥 Detect complaint
    const isComplaint =
      message.toLowerCase().includes("issue") ||
      message.toLowerCase().includes("problem") ||
      message.toLowerCase().includes("not working") ||
      message.toLowerCase().includes("refund");

    // 🔥 Save ticket
    if (isComplaint) {
      await Ticket.create({
        user: userId || null,
        message,
        reply,
        status: "Open"
      });
    }

    res.json({ reply });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/tickets", async (req, res) => {
  const tickets = await Ticket.find().populate("user");
  res.json(tickets);
});

router.put("/tickets/:id/resolve",authMiddleware,  adminMiddleware,  async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = "Resolved";
    await ticket.save();

    res.json({ message: "Ticket marked as resolved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/tickets/:id",authMiddleware, adminMiddleware, async (req, res) => {
  await Ticket.findByIdAndDelete(req.params.id);
  res.json({ message: "Ticket deleted" });
});

module.exports = router; // ✅ VERY IMPORTANT