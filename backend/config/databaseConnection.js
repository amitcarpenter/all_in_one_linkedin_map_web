const mongoose = require("mongoose");

// Connect Database
const DbConnnection = mongoose
  .connect("mongodb://127.0.0.1/Ideas", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("database connnected");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = { DbConnnection };
