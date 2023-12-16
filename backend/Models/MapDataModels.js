const mongoose = require("mongoose");

const MapSchema = new mongoose.Schema(
  {
    email: String,
    companyName: String,
    rating: String,
    ratedBy: String,
    address: String,
    category: String,
    MobileNumber: String,
    websiteLink: String,
    directionsLink: String,
    is_visited: { type: String, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Map_Data = mongoose.model("map_data", MapSchema);

module.exports = Map_Data;
