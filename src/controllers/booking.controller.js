import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Showtime from "../models/showtime.model.js";
import ApiResponce from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Stripe from "stripe";

const bookSeat = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const { date, time } = req.params;
    const { origin } = req.headers;

    const { showId, movieId, seats, theaterId } = req.body;

    const show = await Showtime.findById(showId).populate("movie");

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

    const showTime = dateBlock.showtimes.find((savedTime) => {
      const clientDate = new Date(`${date}T${time}:00+06:00`);

      console.log("Saved time:", savedTime.time.toISOString());
      console.log("Client time:", clientDate.toISOString());
      console.log("Saved time UTC:", savedTime.time.getTime());
      console.log("Client time UTC:", clientDate.getTime());
      console.log("Match:", savedTime.time.getTime() === clientDate.getTime());

      return savedTime.time.getTime() === clientDate.getTime();
    });

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
          { "s.time": new Date(`${date}T${time}:00+06:00`) },
        ],
      }
    );

    const servicecharge = theater.price * 0.06;
    const totalServiceCharge = servicecharge * seats.length;
    const totalPrice = seats.length * theater.price;
    const totalBill = totalServiceCharge + totalPrice;

    const bookingData = {
      userId: user._id,
      showtimeId: showId,
      movieId,
      seats,
      date,
      time,
      totalPrice: totalBill,
    };

    const booking = await Booking.create(bookingData);

    const stripeIinstance = new Stripe(process.env.STRIPE_SK);

    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: show.movie.title,
          },
          unit_amount: Math.floor(booking.totalPrice) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeIinstance.checkout.sessions.create({
      success_url: `${origin}/loading/success`,
      cancel_url: `${origin}/bookings`,
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    console.log(booking._id.toString());
    console.log(session);

    booking.paymentLink = session.url;
    await booking.save({ validateBeforeSave: false });

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

    const { page, limit } = req.query;

    const skip = page * limit;

    const bookings = await Booking.find({ userId: user._id })
      .skip(skip)
      .limit(limit)
      .sort({ bookedAt: -1 })
      .populate("movieId");

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

const getBookingCount = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    const bookingsCount = await Booking.countDocuments({
      userId: user._id,
    });

    res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          bookingsCount,
          "Bookings count fetched successfully!!"
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
  getBookingCount,
};

export default BookingController;

// switch (event.type) {
//   case 'payment_intent.succeeded':
//     const paymentIntentSucceeded = event.data.object;
//     // Then define and call a function to handle the event payment_intent.succeeded
//     break;
//   // ... handle other event types
//   default:
//     console.log(`Unhandled event type ${event.type}`);
// }
