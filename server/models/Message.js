const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,

  // 🔥 ADD (already using in frontend)
  time: String,

  // 🔥 SEEN FEATURE
  seenBy: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model("Message", MessageSchema);
