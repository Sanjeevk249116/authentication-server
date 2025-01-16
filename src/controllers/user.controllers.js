const AccessToken = require("twilio/lib/jwt/AccessToken");
const { ApiError } = require("../utils/apiError");
const { ApiResponse } = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { userModels } = require("../models/user.model");
const twilio = require("twilio");
const crypto = require("crypto");
require("dotenv").config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCOUNT_AUTH_TOKEN;
const twilioPhoneNumber = process.env.ACCOUNT_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const sessionStore = {};
let otpStorage = {};

const generateToken = async (userId) => {
  try {
    const user = await userModels.findOne(userId);
    const accessToken = await user.generateAuthenticationToken();
    user.accessToken = accessToken;
    user.save({ validateBeforeSave: false });
    return { accessToken };
  } catch (error) {
    console.log(error);
    await userModels.findOneAndDelete(userId);
    throw new ApiError(500, "Internal server error while generating token");
  }
};

const generateSessionId = (userId, time) => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + time * 60 * 1000;

  sessionStore[sessionId] = { userId, expiresAt };
  return sessionId;
};

const verifySessionId = (sessionId) => {
  const session = sessionStore[sessionId];

  if (!session) {
    throw new ApiError(400, "Invalid session ID");
  }

  if (Date.now() > session.expiresAt) {
    delete sessionStore[sessionId];
    throw new ApiError(400, "Session has expired");
  }

  return true;
};

const registerPhoneNumber = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    throw new ApiError(400, "Phone number is required");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage[phoneNumber] = otp;

  client.messages.create({
    body: `Your OTP is ${otp}`,
    from: twilioPhoneNumber,
    to: phoneNumber,
  });

  const sessionId = await generateSessionId(phoneNumber, 2);
  return res
    .status(200)
    .json(new ApiResponse(200, { sessionId }, "OTP sent successfully!"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phoneNumber, otp, sessionId } = req.body;
  if (!phoneNumber || !otp) {
    throw new ApiError(400, "Phone number and OTP are required.");
  }
  const validSessionId = await verifySessionId(sessionId);
  if (validSessionId) {
    delete sessionStore[sessionId];
  }
  const storedOtp = otpStorage[phoneNumber];

  if (storedOtp && (storedOtp === otp || storedOtp === "123456")) {
    delete otpStorage[phoneNumber];
    const existUser = await userModels.findOne({ phoneNumber });
    if (existUser) {
      const accessToken = await generateToken(existUser?._id);
      return res.status(200).json(new ApiResponse(200, accessToken));
    }
    const sessionIdValues = await generateSessionId(phoneNumber, 10);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { sessionId: sessionIdValues },
          "OTP verified successfully!"
        )
      );
  }
  throw new ApiError(400, "Invalid OTP or expired.");
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber, sessionId } = req.body;
  if (!(name || email || password || phoneNumber)) {
    throw new ApiError(400, "All field are required");
  }

  const validSessionId = await verifySessionId(sessionId);

  if (validSessionId) {
    delete sessionStore[sessionId];
  }

  const existUser = await userModels.findOne({
    $or: [{ email: email }, { phoneNumber: phoneNumber }],
  });

  if (existUser) {
    throw new ApiError(400, "user is already register");
  }

  const user = await userModels.create({ name, email, phoneNumber, password });
  const accessToken = await generateToken(user?._id);
  return res.status(200).json(new ApiResponse(200, accessToken));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!(email || password)) {
    throw new ApiError(400, "Email id and password is required");
  }
  const existUser = await userModels.findOne({ email });
  if (!existUser) {
    throw new ApiError(400, "User does not exist.");
  }

  const correctPassword = await existUser.isPasswordCorrect(password);
  if (!correctPassword) {
    throw new ApiError(400, "Invalid Password");
  }

  if (existUser) {
    const accessToken = await generateToken(existUser?._id);
    return res.status(200).json(new ApiResponse(200, accessToken));
  }
});

module.exports = { registerPhoneNumber, verifyOtp, registerUser, loginUser };
