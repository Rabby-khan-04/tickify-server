import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token)
      throw new ApiError(status.UNAUTHORIZED, "Unauthorized Access!!");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || !decoded._id)
      throw new ApiError(status.UNAUTHORIZED, "Unauthorized Access");

    const user = await User.findById(decoded._id).select(
      "-createdAt -updatedAt -favorites"
    );

    if (!user) throw new ApiError(status.UNAUTHORIZED, "Unauthorized Access");

    req.user = user;
    next();
  } catch (error) {
    console.log(`Token verification ERROR: ${error}`);

    if (error.name === "TokenExpiredError") {
      throw new ApiError(status.UNAUTHORIZED, "Access token expired");
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(status.UNAUTHORIZED, "Invalid token");
    }

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while verifing token!!"
    );
  }
});

const verifyAdmin = asyncHandler(async (req, _, next) => {
  const { role } = req.user;

  if (role === "admin") {
    return next();
  }
  throw new ApiError(status.FORBIDDEN, "Unauthorized Access!!!");
});

const AuthMiddleware = { verifyJwt, verifyAdmin };

export default AuthMiddleware;
