const DomainName = require("../Models/websiteModels");
const User = require("../Models/UserModels");
const Category = require("../Models/CategoryModels");

const Load_Website_data_table = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const todayFilter = {
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
    const todayData = await DomainName.find(todayFilter);

    const todayEmails = todayData.length;
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const weekFilter = {
      createdAt: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    };
    const weeklyData = await DomainName.find(weekFilter);
    const weeklyEmails = weeklyData.length;
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const MonthFilter = {
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    };
    const monthlyData = await DomainName.find(MonthFilter);

    const MonthlyEmails = monthlyData.length;

    // Calculate Total Data
    const totaldata = await DomainName.find();
    console.log(todayData);
    const secretCodes = await DomainName.find({}, { secretCode: 1, _id: 0 });
    const totalEmails = totaldata.length;

    const userTable = await User.find();
    res.render("map_table", {
      weeklyData,
      totalEmails,
      totaldata,
      todayData,
      todayEmails,
      monthlyData,
      weeklyEmails,
      MonthlyEmails,
      secretCodes,
      userTable,
    });
  } catch (error) {
    console.log(error);
  }
};

const delete_row_data = async (req, res) => {
  try {
    const id = req.params.id;
    // Find the profile by ID and delete it from the database
    const deletedProfile = await DomainName.findByIdAndDelete(id);
    if (!deletedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json({ message: "Profile deleted successfully", deletedProfile });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const filter_Data_by_date = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);

    const endDate = new Date(req.query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const user_id = req.session.user_id;
    const filterbydate = {
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    };
    const filteredData = await DomainName.find(filterbydate);
    res.json(filteredData);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

// Filter by day For |Website
const filter_Data_by_day = async (req, res) => {
  try {
    const selectedDate = new Date(req.query.selectedDate);
    console.log(selectedDate);

    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    const filterbyday = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    x;
    const filteredData = await DomainName.find(filterbyday);
    console.log(filteredData);
    res.json(filteredData);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

// POST Route For Both
const add_category = (req, res) => {
  const { category } = req.body;
  console.log(category);
  if (!category) {
    return res
      .status(400)
      .json({ error: "Name and description are required." });
  }
  const newCategory = new Category({
    category,
  });
  newCategory
    .save()
    .then((savedCategory) => res.status(201).json(savedCategory))
    .catch((err) => {
      res.status(500).json({ error: "Failed to create category." });
      console.log(err);
    });
};

// Get the Category  for Both
const get_category = async (req, res) => {
  await Category.find()
    .then((categories) => {
      res.json(categories);
    })
    .catch((err) =>
      res.status(500).json({ error: "Failed to fetch categories." })
    );
};

// Delete Category
const delete_category = async (req, res) => {
  let categoryValues = req.query.selectedCategory; // Assuming 'selectedCategory' is either an array or a comma-separated string
  console.log(categoryValues);

  try {
    let selectedCategoryArray;

    if (Array.isArray(categoryValues)) {
      selectedCategoryArray = categoryValues;
    } else if (typeof categoryValues === "string") {
      // Split the comma-separated string into an array
      selectedCategoryArray = categoryValues.split(",");
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input. selectedCategory should be an array or a comma-separated string.",
      });
    }

    console.log(selectedCategoryArray);

    // Delete categories based on their values
    const result = await Category.deleteMany({
      category: { $in: selectedCategoryArray },
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Categories not found." });
    }

    return res.json({
      success: true,
      message: "Categories deleted successfully.",
    });
  } catch (error) {
    console.error("Error while deleting categories:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the categories.",
    });
  }
};

// Filter the data date and category in website Emails
const filter_date_and_category = async (req, res) => {
  try {
    const selectedCategories = req.query.selectedCategory;
    console.log(selectedCategories);

    let selectedCategoryArray;

    selectedCategoryArray = Array.isArray(selectedCategories)
      ? selectedCategories
      : [selectedCategories];

    if (typeof selectedCategories === "string") {
      selectedCategoryArray = selectedCategories.split(",");
    }
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    endDate.setHours(23, 59, 59, 999);
    const user_id = req.session.user_id;
    const filterbycategory = {
      category: { $in: selectedCategoryArray },
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    };
    const filteredData = await DomainName.find(filterbycategory);

    res.json(filteredData);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

// Filter By Data by Category  For Website
const filter_Databy_Category = async (req, res) => {
  const selectedCategories = req.query.selectedCategory;
  console.log(selectedCategories);
  try {
    let selectedCategoryArray;

    selectedCategoryArray = Array.isArray(selectedCategories)
      ? selectedCategories
      : [selectedCategories];

    if (typeof selectedCategories === "string") {
      selectedCategoryArray = selectedCategories.split(",");
    }
    const user_id = req.session.user_id;
    const filterbycategory = {
      category: { $in: selectedCategoryArray },
    };
    const filteredData = await DomainName.find(filterbycategory);
    res.json(filteredData);
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
};

// Save Doamin emails in data base
const save_data_in_database = async (req, res) => {
  const { Email, DomainName, category, secretCode, Number } = req.body;
  console.log(secretCode);
  if (secretCode == undefined) {
    const user_id = req.session.user_id || "Guest";
    console.log(req.session);
    const existingLead = await DomainName.findOne({ Email: Email });
    const UserData = await User.findOne({ _id: user_id });

    console.log(UserData);
    console.log(UserData.id);
    const secretCode = UserData.secretCode;

    if (existingLead) {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate email" });
    }

    const newEmail = new DomainName({
      user_id: user_id,
      DomainName: DomainName,
      Email: Email,
      Mobile: Number,
      category: category,
      secretCode: secretCode,
    });
    await newEmail.save();

    console.log("Emails saved successfully to the database!");
    return res.json({ message: "Emails saved successfully to the database" });
  } else {
    const existingLead = await DomainName.findOne({ Email: Email });
    const UserData = await User.findOne({ secretCode: secretCode });

    console.log(UserData);
    console.log(UserData.id);
    const user_id = UserData._id;
    if (existingLead) {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate email" });
    }

    const newEmail = new DomainName({
      user_id: user_id,
      DomainName: DomainName,
      Email: Email,
      Mobile: Number,
      category: category,
      secretCode: secretCode,
    });
    await newEmail.save();
    console.log("Emails saved successfully to the database!");
    return res.json({ message: "Emails saved successfully to the database" });
  }
};

module.exports = {
  Load_Website_data_table,
  delete_row_data,
  save_data_in_database,
  filter_Data_by_date,
  filter_Data_by_day,
  add_category,
  get_category,
  delete_category,
  filter_date_and_category,
  filter_Databy_Category,
};
