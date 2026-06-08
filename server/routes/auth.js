const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY)
  .digest();

function encrypt(text) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    SECRET_KEY,
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText) {
  const parts = encryptedText.split(":");

  const iv = Buffer.from(parts[0], "hex");
  const encryptedData = parts[1];

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    SECRET_KEY,
    iv
  );

  let decrypted = decipher.update(
    encryptedData,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
}

router.get("/check-username/:username", async (req, res) => {

  const username =
    req.params.username
      .toLowerCase()
      .trim();

  const exists =
    await User.findOne({ username });

  res.json({
    available: !exists
  });
});
// REGISTER
router.post("/register", async (req, res) => {
  try {
    let { username, password } = req.body;

username =
  username
    .toLowerCase()
    .trim();
   if (!/^[a-z0-9._]+$/.test(username)) {

  return res.status(400).json({
    success: false,
    message:
      "Usernames can only use letters, numbers, underscores and periods."
  });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Username already exists"
      });
    }

    const encryptedPassword = encrypt(password);

    await User.create({
      username,
      password: encryptedPassword
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ success: false });
    }

    const originalPassword = decrypt(user.password);

    if (originalPassword === password) {

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

  return res.json({
    success: true,
    token
  });
}
    res.json({
      success: false
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});

module.exports = router;
