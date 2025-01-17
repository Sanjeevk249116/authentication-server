const express = require("express");
const {
  registerPhoneNumber,
  verifyOtp,
  registerUser,
  loginUser,
  userProfile,
} = require("../controllers/user.controllers");
const { authenticateUser } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/send-otp", registerPhoneNumber);
router.post("/verify-otp", verifyOtp);
router.post("/registration/last-step", registerUser);
router.post("/login", loginUser);

//sercure routes
router.get("/profile/:id", userProfile);

module.exports = { router };
