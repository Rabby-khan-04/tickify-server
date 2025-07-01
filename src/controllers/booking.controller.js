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

const BookingController = { bookSeat };

export default BookingController;
