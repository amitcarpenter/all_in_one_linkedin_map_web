const mongoose = require("mongoose");

const Category_sechema = mongoose.Schema(
  {
    category: { type: String },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("category", Category_sechema);

module.exports = Category;
