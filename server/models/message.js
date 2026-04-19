const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String
});

module.exports = mongoose.model("Message", MessageSchema);