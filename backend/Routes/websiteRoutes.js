const express = require("express");
const { Load_Website_data_table } = require("../Controllers/websiteController");

const website_router = express.Router();

website_router.get("/website_table_data", Load_Website_data_table);

module.exports = website_router;
