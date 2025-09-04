import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiResponce from "../utils/ApiResponse.js";
import { cookieOptions } from "../constants.js";
import jwt from "jsonwebtoken";
import Movie from "../models/movie.model.js";
import mongoose from "mongoose";

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
  const incomingRefreshToken =
    req?.cookies?.refreshToken || req?.body?.refreshToken;

  if (incomingRefreshToken) {
    try {
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
    } catch {}
  }

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(status.OK)
    .json(new ApiResponce(status.OK, {}, "User logged out successfully!!"));
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

const addFavoriteMovies = asyncHandler(async (req, res) => {
  try {
    const incomingUser = req.user;
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) throw new ApiError(status.NOT_FOUND, "Movie not found!!");

    const user = await User.findById(incomingUser._id);

    if (!user) throw new ApiError(status.NOT_FOUND, "User not found!!");

    if (user.favorites.includes(movieId))
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, "Movie already in favorites!!"));

    user.favorites.push(movieId);
    await user.save();

    return res
      .status(status.CREATED)
      .json(new ApiResponce(status.OK, {}, "Movie added to favorite"));
  } catch (error) {
    console.log(`ERROR in add favorite movie: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while adding movie to favorite!!"
    );
  }
});

const removeMovieFromFavorites = asyncHandler(async (req, res) => {
  try {
    const { movieId } = req.params;
    const incomingUser = req.user;

    const user = await User.findById(incomingUser._id);

    if (user.favorites.includes(movieId)) {
      const newFav = user.favorites.filter(
        (favorite) => favorite.toString() !== movieId
      );

      user.favorites = newFav;
      await user.save();

      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, "Movie removed from favorites!!"));
    } else {
      throw new ApiError(status.NOT_FOUND, "Movie does not exist in favorites");
    }
  } catch (error) {
    console.log(`ERROR in removing movie from frovites: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.OK,
      "Something went wrong while removing movie from favorite list!!"
    );
  }
});

const getFavoriteMovies = asyncHandler(async (req, res) => {
  try {
    const incomingUser = req.user;

    const user = await User.findById(incomingUser._id).populate({
      path: "favorites",
      select: "-casts -genres",
    });

    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          user,
          "Favorite movies fetched successfully!!"
        )
      );
  } catch (error) {
    console.log(`ERROR in fetching frovite moives: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.OK,
      "Something went wrong while fetching favorite movies!!"
    );
  }
});
const UserController = {
  registerUser,
  issueJWT,
  refreshAccessToken,
  logoutUser,
  getAUser,
  addFavoriteMovies,
  removeMovieFromFavorites,
  getFavoriteMovies,
};

export default UserController;
