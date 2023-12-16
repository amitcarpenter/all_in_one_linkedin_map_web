const Users_Data = require("../Models/LinkedinModles");

// Sub Admin Table
const Load_Linkedin_data_table = async (req, res) => {
  try {
    const users = await Users_Data.find();
    return res
      .status(200)
      .render("linkedin_table_data", {
        success: true,
        data_for_linkedin: users,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { Load_Linkedin_data_table };
