const express = require("express");
const {
  Load_Linkedin_data_table,
} = require("../Controllers/LinkedInController");

const linkedin_router = express.Router();

linkedin_router.get("/linkedin_table_data", Load_Linkedin_data_table);

module.exports = linkedin_router;
