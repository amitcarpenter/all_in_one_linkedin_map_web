const mongoose = require("mongoose");

const Users_Data_Schema = mongoose.Schema(
  {
    name: { type: String },
    profile_image_link: { type: String },
    commentText: { type: String },
    comment_date: { type: String },
    technology: { type: String },
    profile_url: { type: String },
    location: { type: String, default: null },
    category: { type: String },
    is_connection_send: { type: String, default: 0 },
    user_email: { type: String, default: null },
    user_phone: { type: String, default: null },
    is_visited: { type: String, default: 0 },
    status: { type: String, default: 0 },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

const Users_Data = mongoose.model("linkedin_user_data", Users_Data_Schema);

module.exports = Users_Data;
