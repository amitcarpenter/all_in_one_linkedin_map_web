const express = require("express");
const fs = require("fs");
const multer = require("multer");

const {
  Email_Data_Load,
  Add_Email,
  Email_CSV_Upload,
  Form_For_Service,
  Check_Order_Service,
  Edit_Order,
} = require("../Controllers/EmailController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const email_router = express.Router();

email_router.post(
  "/upload_email_csv",
  upload.single("csvFile"),
  Email_CSV_Upload
);

email_router.get("/email_table", Email_Data_Load);
email_router.post("/Add_Email", Add_Email);

email_router.get("/form", Form_For_Service);

email_router.get("/check_order", Check_Order_Service);

email_router.get("/edit_order", Edit_Order);

module.exports = email_router;
