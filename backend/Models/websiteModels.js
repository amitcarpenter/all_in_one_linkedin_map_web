const mongoose = require("mongoose");
const domainemails = new mongoose.Schema({
  user_id: { type: String },
  secretCode: { type: String },
  DomainName: { type: String },
  Email: { type: String, unique: true },
  Mobile: { type: Number },
  createdAt: { type: Date, default: Date.now },
  category: { type: String, default: "" },
});

const DomainEmail = mongoose.model("web_data", domainemails);

module.exports = DomainEmail;
