import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Theater from "../models/theater.model.js";
import ApiResponce from "../utils/ApiResponse.js";

const addTheater = asyncHandler(async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location)
      throw new ApiError(status.BAD_REQUEST, "Name and location are required");

    const existingTheater = await Theater.findOne({ name, location });

    if (existingTheater)
      throw new ApiError(status.CONFLICT, "The theater already exists!!");

    const newTheater = new Theater({ name, location });
    await newTheater.save();

    return res
      .status(status.CREATED)
      .json(
        new ApiResponce(
          status.CREATED,
          newTheater,
          "New theater added successfully"
        )
      );
  } catch (error) {
    console.log(`Theater Addition ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while adding new theater!!"
    );
  }
});

const getAllTheaters = asyncHandler(async (req, res) => {
  try {
    const theater = await Theater.find({});

    res
      .status(status.OK)
      .json(
        new ApiResponce(status.OK, theater, "Theaters fetched successfully!!")
      );
  } catch (error) {
    console.log(`Theater fetching ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching the theaters!!"
    );
  }
});
const getATheater = asyncHandler(async (req, res) => {
  try {
    const { theaterId } = req.params;
    const theater = await Theater.findById(theaterId);

    res
      .status(status.OK)
      .json(
        new ApiResponce(status.OK, theater, "Theater fetched successfully!!")
      );
  } catch (error) {
    console.log(`Theater fetching ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching the theaters!!"
    );
  }
});

const deleteTheater = asyncHandler(async (req, res) => {
  try {
    const { theaterId } = req.params;

    const theater = await Theater.findByIdAndDelete(theaterId);

    if (!theater)
      throw new ApiError(status.NOT_FOUND, "Theater does not exist!!");

    res
      .status(status.OK)
      .json(new ApiResponce(status.OK, {}, "Theater deleted successfully"));
  } catch (error) {
    console.log(`Theater deletion ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while deleting theater!!"
    );
  }
});

const TheaterController = {
  addTheater,
  getAllTheaters,
  deleteTheater,
  getATheater,
};

export default TheaterController;
