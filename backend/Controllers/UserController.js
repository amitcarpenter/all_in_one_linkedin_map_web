const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModels");
const { validationResult } = require("express-validator");

require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET_KEY || "default-secret-key";

// Function to hash the password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Add User Load Page
const Load_Add_User = async (req, res) => {
  try {
    res.render("createNew");
  } catch (error) {
    console.log(error);
  }
};

//Add User
const Add_User = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, mobileNumber } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash the password before saving it
    const hashedPassword = await hashPassword(password);

    // Create a new user instance
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      mobileNumber,
    });

    const savedUser = await newUser.save();

    res.status(201).json({ success: true, user: savedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Load Login Page
const Load_Login = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error);
  }
};

// Login the User
const User_Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.session.user_id = user._id;
        const token = jwt.sign({ userId: user._id }, jwtSecretKey);
        return res.status(200).json({ success: true, userId: user._id, token });
      } else {
        return res
          .status(401)
          .json({ message: "Email and Password are incorrect" });
      }
    } else {
      return res
        .status(401)
        .json({ message: "Email and Password are incorrect" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Dashboard Loader
const Dashboard_Loader = async (req, res) => {
  try {
    res.render("index");
  } catch (error) {
    console.log(error);
  }
};

const User_Table_Load = (req, res) => {
  try {
    res.render("table");
  } catch (error) {
    console.log(error);
  }
};

// Sub Admin Table
const Sub_Admin_Table_Load = async (req, res) => {
  try {
    const users = await User.find({ is_admin: 0 });
    res.status(200).render("subAdminTable", { success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Profile Loader
const Profile_Loader = async (req, res) => {
  try {
    const userId = req.session.user_id;
    console.log(userId);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const profileData = await User.findById(userId);

    if (!profileData) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).render("profile", { profileData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const Edit_Profile = async (req, res) => {
  // const { fullName, email, mobileNumber, about, address, country } = req.body;
  console.log(req.body);
  const userId = req.session.user_id;
  try {
    // Find user by ID and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json({ success: true, message: "update SuccessFully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Profile Loader
const subAdmin_dashboard = async (req, res) => {
  try {
    res.render("subAdminDashboard");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Load order history 
const order_history_view = async (req, res) => {
  try {
    res.render("orderHistoryView");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Profile Loader
const Set_Target_For_Video = async (req, res) => {
  try {
    res.render("setChanneDetails");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
