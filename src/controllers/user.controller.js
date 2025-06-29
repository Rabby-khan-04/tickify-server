import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiResponce from "../utils/ApiResponse.js";
import { cookieOptions } from "../constants.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(`Token generation ERROR: ${error}`);
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while generating token!!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new ApiError(status.BAD_REQUEST, "Email and name are required!!");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(
        status.CONFLICT,
        "Email already exists. Please use a different email!!"
      );
    }

    const newUser = new User({ name, email });

    const user = await newUser.save();

    return res
      .status(status.CREATED)
      .json(
        new ApiResponce(status.CREATED, user, "User registered successfully!!")
      );
  } catch (error) {
    console.log(`Registration Error: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while registering the user!"
    );
  }
});

const issueJWT = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      throw new ApiError(
        status.BAD_REQUEST,
        "Credentials are required to login!!"
      );

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(status.UNAUTHORIZED, "Invalid email!!");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(status.OK)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponce(
          status.OK,
          { accessToken, refreshToken },
          "User logged in successfully!!"
        )
      );
  } catch (error) {
    console.log(`Login ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while login the user!"
    );
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ||
    req.header("Authorization").replace("Bearer ", "");
  if (!incomingRefreshToken)
    throw new ApiError(status.UNAUTHORIZED, "Unauthorized request!!");

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  try {
    const user = await User.findById(decodedToken._id).select("+refreshToken");

    if (!user) throw new ApiError(status.UNAUTHORIZED, "Invalid token!!");

    if (incomingRefreshToken !== user.refreshToken)
      throw new ApiError(401, "Refresh token is expired or used!!");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(status.OK)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponce(
          status.OK,
          { accessToken, refreshToken },
          "Access token refreshed!!"
        )
      );
  } catch (error) {
    console.log(`Access token refreshing ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while refreshing access token!!"
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req?.cookies?.refreshToken || req?.body?.refreshToken;

    if (!incomingRefreshToken)
      throw new ApiError(status.UNAUTHORIZED, "Unauthorized Access!!");

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id).select("+refreshToken");

    if (!user || incomingRefreshToken !== user.refreshToken)
      throw new ApiError(
        status.UNAUTHORIZED,
        "Invalid or expired refresh token!!"
      );

    await User.findByIdAndUpdate(user._id, { $unset: { refreshToken: 1 } });

    return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, "User logged out successfully!!"));
  } catch (error) {
    console.log(`Logout Error: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while logging out user!!"
    );
  }
});

const getAUser = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    return res
      .status(status.OK)
      .json(
        new ApiResponce(status.OK, user, "User info fetched successfully!!")
      );
  } catch (error) {
    console.log(`Getting User info ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while getting user info!!"
    );
  }
});

const UserController = {
  registerUser,
  issueJWT,
  refreshAccessToken,
  logoutUser,
  getAUser,
};

export default UserController;
