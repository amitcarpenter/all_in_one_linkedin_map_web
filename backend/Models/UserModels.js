const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  profileImage: {
    type: String,
    default: "",
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  about: {
    type: String,
  },
  country: {
    type: String,
  },
  address: {
    type: String,
  },
  is_admin: {
    type: String,
    default: "0",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
