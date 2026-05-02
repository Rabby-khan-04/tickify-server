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
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Movie.countDocuments(),
      Movie.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Movie.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookedAt: { $gte: startOfThisMonth } }),
      Booking.countDocuments({
        bookedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
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
      Theater.countDocuments(),
      Theater.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Showtime.aggregate([
        { $unwind: "$theaters" },
        { $unwind: "$theaters.dates" },
        {
          $match: {
            "theaters.dates.date": { $gte: now.toISOString().split("T")[0] },
          },
        },
        { $count: "total" },
      ]),
    ]);

    const pctChange = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const totalRevenue = revenueResult[0]?.total ?? 0;
    const revThisMonth = revenueThisMonth[0]?.total ?? 0;
    const revLastMonth = revenueLastMonth[0]?.total ?? 0;
    const activeShowtimes = showtimeCount[0]?.total ?? 0;

    return res.status(status.OK).json(
      new ApiResponce(
        status.OK,
        {
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
          activeShowtimes: { value: activeShowtimes, change: null },
          totalTheaters: { value: totalTheaters, newThisMonth: newTheaters },
        },
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

// GET /api/v1/dashboard/charts
// Bar chart: monthly bookings + revenue (last 6 months)
// Pie chart 1: booking status breakdown
// Pie chart 2: top genres from movie catalog
const getDashboardCharts = asyncHandler(async (req, res) => {
  try {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        label: d.toLocaleString("en-US", { month: "short" }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      };
    });

    const [monthlyRaw, statusBreakdown, genreBreakdown] = await Promise.all([
      // Monthly bookings + revenue per month
      Promise.all(
        months.map(async ({ label, start, end }) => {
          const [count, revenueResult] = await Promise.all([
            Booking.countDocuments({ bookedAt: { $gte: start, $lte: end } }),
            Booking.aggregate([
              { $match: { bookedAt: { $gte: start, $lte: end } } },
              { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ]),
          ]);
          return {
            month: label,
            bookings: count,
            revenue: revenueResult[0]?.total ?? 0,
          };
        }),
      ),

      // Booking status breakdown (pie)
      Booking.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, name: "$_id", value: "$count" } },
      ]),

      // Top 6 genres (pie)
      Movie.aggregate([
        { $unwind: "$genres" },
        { $group: { _id: "$genres.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $project: { _id: 0, name: "$_id", value: "$count" } },
      ]),
    ]);

    return res.status(status.OK).json(
      new ApiResponce(
        status.OK,
        {
          monthlyBookingsAndRevenue: monthlyRaw,
          bookingStatusBreakdown: statusBreakdown,
          topGenres: genreBreakdown,
        },
        "Chart data fetched successfully!!",
      ),
    );
  } catch (error) {
    console.log(`ERROR in getDashboardCharts: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching chart data!!",
    );
  }
});

const DashboardController = { getDashboardStats, getDashboardCharts };
export default DashboardController;
