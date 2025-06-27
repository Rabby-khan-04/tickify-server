import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiResponce from "../utils/ApiResponse.js";

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

    res
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

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user._id
    );

    res
      .status(status.OK)
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

const UserController = { registerUser, issueJWT };

export default UserController;
