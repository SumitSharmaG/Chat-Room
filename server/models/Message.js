const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  time: String,
  // 🆕 World chat ke liye "world" rahega, private ke liye user ka naam
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
