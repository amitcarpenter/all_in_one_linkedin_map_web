const express = require("express");
const {
  Load_Map_data_table,
  delete_row_data,
  filter_Data_by_date,
  filter_Data_by_day,
  add_category,
  get_category,
  delete_category,
  filter_date_and_category,
  filter_Databy_Category,
  save_data_in_database,
} = require("../Controllers/MapDataController");

const map_router = express.Router();

map_router.get("/map_table_data", Load_Map_data_table);
map_router.post("/api/save-emails", save_data_in_database);

map_router.get("/filterDatabydate", filter_Data_by_date);
map_router.get("/filterDatabyday", filter_Data_by_day);

map_router.post("/api/categories", add_category);
map_router.get("/api/categories", get_category);
map_router.delete("/api/categories", delete_category);

map_router.get("/filterdateandcategory", filter_date_and_category);
map_router.get("/api/filterDatabyCategory", filter_Databy_Category);

map_router.delete("/map/domainEmail/:id", delete_row_data);
module.exports = map_router;
