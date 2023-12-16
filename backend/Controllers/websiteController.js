const DomainEmail = require("../Models/websiteModels");


const Load_Website_data_table = async (req, res) => {
  try {
    const users = await DomainEmail.find();
    return res
      .status(200)
      .render("website_table_data", { success: true, data_for_web: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { Load_Website_data_table };
