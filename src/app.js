const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { router } = require("./routes/router");

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  cors({
    origin: "*",
  })
);
app.use("/user", router);

module.exports = { app };
