const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");  // move outside

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verified;
    console.log("Decoded user:", verified);
    next();

  } catch (err) {
    console.log("SECRET:", process.env.JWT_SECRET);
    console.log("HEADER:", authHeader);

    return res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
