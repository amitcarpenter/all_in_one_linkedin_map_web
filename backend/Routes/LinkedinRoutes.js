const express = require("express");
const {
  Load_Linkedin_data_table,
  delete_row_data,
  filter_Data_by_date,
  filter_Data_by_day,
  add_category,
  get_category,
  delete_category,
  filter_date_and_category,
  filter_Databy_Category,
} = require("../Controllers/LinkedInController");

const linkedin_router = express.Router();

linkedin_router.get("/linkedin_table_data", Load_Linkedin_data_table);

linkedin_router.delete("/linkedin/domainEmail/:id", delete_row_data);
linkedin_router.post("/api/save-emails", delete_row_data);

linkedin_router.get("/filterDatabydate", filter_Data_by_date);
linkedin_router.get("/filterDatabyday", filter_Data_by_day);

linkedin_router.post("/api/categories", add_category);
linkedin_router.get("/api/categories", get_category);
linkedin_router.delete("/api/categories", delete_category);

linkedin_router.get("/filterdateandcategory", filter_date_and_category);
linkedin_router.get("/api/filterDatabyCategory", filter_Databy_Category);

module.exports = linkedin_router;
