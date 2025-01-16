const express = require("express");
const {
  registerPhoneNumber,
  verifyOtp,
  registerUser,
  loginUser,
} = require("../controllers/user.controllers");
const router = express.Router();

router.post("/send-otp", registerPhoneNumber);
router.post("/verify-otp", verifyOtp);
router.post("/registration/last-step", registerUser);
router.post("/login", loginUser);

module.exports = { router };
