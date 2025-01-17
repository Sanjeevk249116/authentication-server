const mongoose = require("mongoose");
const { app } = require("./src/app");
const { connection } = require("./src/config/connection");
require("dotenv").config();



app.listen(process.env.PORT, async () => {
  try {
    connection();
    console.log(`Server is running on port ${process.env.PORT || 8080}`);
  } catch (error) {
    console.log("failed to connect server");
  }
});
