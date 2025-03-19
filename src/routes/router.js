const express = require("express");
const {
  registerPhoneNumber,
  verifyOtp,
  registerUser,
  loginUser,
  userProfile,
  registerNewSeller,
  deleteNewSellerAccount,
  changePassword,
} = require("../controllers/user.controllers");
const { authenticateUser } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/account/create/step-1", registerPhoneNumber);
router.post("/account/create/step-2", verifyOtp);
router.post("/account/create/step-3", registerUser);
router.post("/login", loginUser);
router.post("/register-newSeller", registerNewSeller);
router.delete("/delete-newSeller/:email", deleteNewSellerAccount);

//sercure routes
router.get("/profile/:id", userProfile);
router.put("/authenticate/change-password", changePassword);
module.exports = { router };
