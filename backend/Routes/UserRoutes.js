const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  Load_Add_User,
  Add_User,
  Load_Login,
  User_Login,
  Dashboard_Loader,
  User_Table_Load,
  Sub_Admin_Table_Load,
  Profile_Loader,
  Edit_Profile,
  subAdmin_dashboard,
  Set_Target_For_Video,
  order_history_view,
} = require("../Controllers/UserController");

// Multer use for Image upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + Date.now());
//   },
// });
// const upload = multer({ storage: storage });



const user_router = express.Router();

// Middle ware
user_router.use(express.json());
user_router.use(express.urlencoded({ extended: true }));

// Routing

user_router.get("/Add-User", Load_Add_User);
user_router.post("/Add-User", Add_User);

user_router.get("/", Load_Login);
user_router.post("/", User_Login);

user_router.get("/dashboard", Dashboard_Loader);

user_router.get("/table", User_Table_Load);

user_router.get("/sub_admin_table", Sub_Admin_Table_Load);

user_router.get("/profile", Profile_Loader);
user_router.post("/edit_profile", Edit_Profile);

user_router.get("/sub_admin_dashboard", subAdmin_dashboard);

user_router.get("/set_target_video", Set_Target_For_Video);

user_router.get("/order_history_view", order_history_view);






module.exports = user_router;
