import status from "http-status";
import ApiError from "../utils/ApiError.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";
import ApiResponce from "../utils/ApiResponse.js";

const registerUser = AsyncHandler(async (req, res) => {
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

const UserController = { registerUser };

export default UserController;
