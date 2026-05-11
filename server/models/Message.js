const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  time: String,
  // 🆕 Naya Field: "world" ya receiver ka username
  receiver: {
    type: String,
    default: "world"
  },
  seenBy: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model("Message", MessageSchema);
