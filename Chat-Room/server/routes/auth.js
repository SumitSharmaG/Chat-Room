const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ username, password: hashed });

  res.json({ success: true });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.json({ success: false });

  const match = await bcrypt.compare(password, user.password);

  if (match) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

module.exports = router;