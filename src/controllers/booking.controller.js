import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Showtime from "../models/showtime.model.js";
import ApiResponce from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";

const bookSeat = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const { date, time } = req.params;

    const { showId, movieId, seats, theaterId } = req.body;

    const show = await Showtime.findById(showId);

    if (!show)
      throw new ApiError(
        status.NOT_FOUND,
        "Show not found for given theater/date/time!!"
      );

    const theater = show.theaters.find(
      (savedTheater) => savedTheater.theaterId.toString() === theaterId
    );

    const dateBlock = theater?.dates.find(
      (savedDate) => savedDate.date === date
    );

    const showTime = dateBlock.showtimes.find(
      (savedTime) =>
        savedTime.time.getTime() === new Date(`${date}T${time}`).getTime()
    );

    if (!showTime)
      throw new ApiError(
        status.NOT_FOUND,
        "Show not found for given theater/date/time!!"
      );

    const alreadyBookedSeats = showTime.bookedSeats || [];

    const duplicateSeats = seats.filter((seat) =>
      alreadyBookedSeats.includes(seat)
    );

    if (duplicateSeats.length > 0)
      throw new ApiError(status.OK, "Some seate are alredy booked");

    await Showtime.updateOne(
      { _id: showId },
      {
        $addToSet: {
          "theaters.$[t].dates.$[d].showtimes.$[s].bookedSeats": {
            $each: seats,
          },
        },
      },
      {
        arrayFilters: [
          {
            "t.theaterId": new mongoose.Types.ObjectId(theaterId),
          },
          { "d.date": date },
          { "s.time": new Date(`${date}T${time}`) },
        ],
      }
    );

    const bookingData = {
      userId: user._id,
      showtimeId: showId,
      movieId,
      seats,
      date,
      time,
      totalPrice: seats.length * theater.price,
    };

    const booking = await Booking.create(bookingData);

    res
      .status(status.CREATED)
      .json(
        new ApiResponce(status.CREATED, booking, "Seat booked successfully!!")
      );
  } catch (error) {
    console.log(`ERROR in book seat: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while booking a seat!!"
    );
  }
});

const getMyBookings = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    const bookings = await Booking.find({ userId: user._id });

    res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          bookings,
          "Bookings data fetched successfully!!"
        )
      );
  } catch (error) {
    console.log(`ERROR in fetching my bookings: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching my bookings!!"
    );
  }
});

const getSpecificBooking = asyncHandler(async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          booking,
          "Booking data fetched successfully!!"
        )
      );
  } catch (error) {
    console.log(`ERROR in sepecific booking data fetching: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching specifc booking!!"
    );
  }
});

const getBookingForShowtime = asyncHandler(async (req, res) => {
  try {
    const { showtimeId } = req.params;

    const bookings = await Booking.find({ showtimeId });

    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          bookings,
          "Booking for a showtime fetched successfully!!"
        )
      );
  } catch (error) {
    console.log(`ERROR in fetching booking for showtime: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Somethign went wrong while fetching bookings for a showtime!!"
    );
  }
});

const getAllbookings = asyncHandler(async (req, res) => {
  try {
    const bookings = await Booking.find({});

    return res
      .status(status.OK)
      .json(
        new ApiResponce(status.OK, bookings, "Bookings fetched successfully!!")
      );
  } catch (error) {
    console.log(`ERROR in fetching bookings: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Somethign went wrong while fetching bookings!!"
    );
  }
});

const BookingController = {
  bookSeat,
  getMyBookings,
  getSpecificBooking,
  getBookingForShowtime,
  getAllbookings,
};

export default BookingController;
