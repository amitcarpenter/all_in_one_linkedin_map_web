const express = require("express");
const { Load_Map_data_table, delete_row_data } = require("../Controllers/MapDataController");

const map_router = express.Router();

map_router.get("/map_table_data", Load_Map_data_table);
map_router.delete("/domainEmail/:id", delete_row_data);
map_router.post("/api/save-emails", delete_row_data);

module.exports = map_router;
