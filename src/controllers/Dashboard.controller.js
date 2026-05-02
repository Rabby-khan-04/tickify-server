import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponce from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import Booking from "../models/booking.model.js";
import Showtime from "../models/showtime.model.js";
import Theater from "../models/theater.model.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Run all aggregations in parallel
    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      totalMovies,
      moviesThisMonth,
      moviesLastMonth,
      totalBookings,
      bookingsThisMonth,
      bookingsLastMonth,
      revenueResult,
      revenueThisMonth,
      revenueLastMonth,
      totalTheaters,
      newTheaters,
      showtimeCount,
    ] = await Promise.all([
      // Users
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),

      // Movies
      Movie.countDocuments(),
      Movie.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Movie.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),

      // Bookings
      Booking.countDocuments(),
      Booking.countDocuments({ bookedAt: { $gte: startOfThisMonth } }),
      Booking.countDocuments({
        bookedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),

      // Total revenue from bookings totalPrice
      Booking.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Booking.aggregate([
        { $match: { bookedAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            bookedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      // Theaters
      Theater.countDocuments(),
      Theater.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

      // Active showtimes (today onwards)
      Showtime.aggregate([
        { $unwind: "$theaters" },
        { $unwind: "$theaters.dates" },
        {
          $match: {
            "theaters.dates.date": {
              $gte: now.toISOString().split("T")[0],
            },
          },
        },
        { $count: "total" },
      ]),
    ]);

    // Helper: compute % change
    const pctChange = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const totalRevenue = revenueResult[0]?.total ?? 0;
    const revThisMonth = revenueThisMonth[0]?.total ?? 0;
    const revLastMonth = revenueLastMonth[0]?.total ?? 0;
    const activeShowtimes = showtimeCount[0]?.total ?? 0;

    const stats = {
      totalUsers: {
        value: totalUsers,
        change: pctChange(usersThisMonth, usersLastMonth),
      },
      totalMovies: {
        value: totalMovies,
        change: pctChange(moviesThisMonth, moviesLastMonth),
      },
      totalBookings: {
        value: totalBookings,
        change: pctChange(bookingsThisMonth, bookingsLastMonth),
      },
      totalRevenue: {
        value: totalRevenue,
        change: pctChange(revThisMonth, revLastMonth),
      },
      activeShowtimes: {
        value: activeShowtimes,
        change: null, // steady — no meaningful delta
      },
      totalTheaters: {
        value: totalTheaters,
        newThisMonth: newTheaters,
      },
    };

    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          stats,
          "Dashboard stats fetched successfully!!",
        ),
      );
  } catch (error) {
    console.log(`ERROR in getDashboardStats: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching dashboard stats!!",
    );
  }
});

const DashboardController = { getDashboardStats };

export default DashboardController;
