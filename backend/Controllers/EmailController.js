const Email = require("../Models/EmailModels");
const csv = require("csv-parser");
const fs = require("fs");
const { Readable } = require("stream");

// Form for the service
const Form_For_Service = (req, res) => {
  try {
    res.render("form");
  } catch (error) {
    console.log(error);
  }
};

// Check Orders
const Check_Order_Service = (req, res) => {
  try {
    res.render("checkOrder");
  } catch (error) {
    console.log(error);
  }
};

//Edit the Order
const Edit_Order = (req, res) => {
  try {
    res.render("editOrder");
  } catch (error) {
    console.log(error);
  }
};

// Email Load Page
const Email_Data_Load = async (req, res) => {
  try {
    const emails = await Email.find();
    res.render("EmailTable", { success: true, data: emails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add Email Data
const Add_Email = async (req, res) => {
  try {
    const { email, password, ip } = req.body;
    console.log(req.body);

    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Create a new user instance
    const newEmail = new Email({
      email,
      password,
      ip,
    });

    const savedEmail = await newEmail.save();

    res.json({ success: true, email: savedEmail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle file upload
const Email_CSV_Upload = async (req, res) => {
  const rows = [];

  // Create a readable stream from the buffer
  const bufferStream = new Readable();
  bufferStream.push(req.file.buffer);
  bufferStream.push(null); // Signal the end of the stream

  // Parse CSV data using csv-parser stream
  bufferStream
    .pipe(csv({ headers: true }))
    .on("data", (row) => {
      // Map each row to a new object with desired keys
      const userData = {
        email: row._0,
        password: row._1,
        ip: row._2,
      };
      rows.push(userData);
    })
    .on("end", async () => {
      try {
        // Save data to the database
        const savedData = await Email.insertMany(rows);
        console.log("CSV data saved to the database:", savedData);
        res.status(201).redirect("/email_table");
      } catch (error) {
        console.error("Error saving data to the database:", error);
        res.status(500).send("Internal Server Error");
      }
    })
    .on("error", (error) => {
      console.error("Error parsing CSV data:", error);
      res.status(400).send("Bad Request");
    });
};

module.exports = {
  Email_Data_Load,
  Add_Email,
  Email_CSV_Upload,
  Form_For_Service,
  Check_Order_Service,
  Edit_Order,
};
