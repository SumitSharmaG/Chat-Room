const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-z0-9._]+$/
  },

  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("User", UserSchema);
