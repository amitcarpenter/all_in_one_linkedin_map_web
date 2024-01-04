const mongoose = require("mongoose");

const withdraw_schema = new mongoose.Schema(
  {
    profile_link: String,
    is_visited: { type: String, default: 0 },
  },
  {
    timestamps: true,
  }
);

const WithdrawList = mongoose.model("withdraw_links", withdraw_schema);

module.exports = WithdrawList;
