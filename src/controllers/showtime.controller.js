import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Movie from "../models/movie.model.js";
import axios from "axios";
import Showtime from "../models/showtime.model.js";
import ApiResponce from "../utils/ApiResponse.js";

const addShow = asyncHandler(async (req, res) => {
  try {
    const { movieId, theaters } = req.body;

    let movie = await Movie.findOne({ movieId });

    if (!movie) {
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            Accept: "Application/json",
            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
          },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: {
            Accept: "Application/json",
            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
          },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const creditData = movieCreditsResponse.data;

      if (!movieApiData || !creditData)
        throw new ApiError(status.NOT_FOUND, "Movie not found!!");

      const movieDetails = {
        movieId: movieApiData.id,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: creditData.cast.splice(0, 11),
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        popularity: movieApiData.popularity,
        tagline: movieApiData.tagline,
        runtime: movieApiData.runtime,
        vote_average: movieApiData.vote_average,
        adult: movieApiData.adult,
      };

      movie = await Movie.create(movieDetails);
    }

    theaters.forEach((theater) => {
      theater.dates.forEach((dateTiem) => {
        dateTiem.showtimes = dateTiem.showtimes.map((time) => ({
          time: new Date(`${dateTiem.date}T${time}`),
        }));
      });
    });

    const showData = {
      movie: movie._id,
      theaters,
    };

    const show = await Showtime.create(showData);

    if (!show)
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Something went wrong while adding a showtime!!"
      );

    return res
      .status(status.CREATED)
      .json(new ApiResponce(status.CREATED, show, "Show added successfully!!"));
  } catch (error) {
    console.log(`Showtime addition ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while adding a showtime!!"
    );
  }
});

const getAllShows = asyncHandler(async (req, res) => {
  try {
    const shows = await Showtime.find()
      .populate({ path: "movie", select: "-casts" })
      .populate("theaters.theaterId")
      .lean();

    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, shows, "Shows fetched successfully!!"));
  } catch (error) {
    console.log(`ERROR in get all show: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching all shows!!"
    );
  }
});

const getUpcomingShow = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const rawShows = await Showtime.find()
      .populate({
        path: "movie",
        select: "-casts",
      })
      .populate("theaters.theaterId");

    if (rawShows.length < 1)
      throw new ApiError(status.NOT_FOUND, "There is no upcoming show!!");

    const shows = rawShows.filter((show) =>
      show.theaters.some((theater) =>
        theater.dates.some((dateObj) =>
          dateObj.showtimes.some((timeObj) => timeObj.time > now)
        )
      )
    );

    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          shows,
          "Upcoming shows fetched successfully!!"
        )
      );
  } catch (error) {
    console.log(`Upcoming show ERROR: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Somethign went wrong while fetching upcoming shows!!"
    );
  }
});

const getAShow = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const { showId } = req.params;

    const show = await Showtime.findById(showId)
      .populate("movie")
      .populate("theaters.theaterId");

    const futureShowTimes = show.theaters
      .map((theater) => {
        const cleanedDates = theater.dates
          .map((dateObj) => {
            const futureTimes = dateObj.showtimes.filter(
              (time) => time.time > now
            );

            const plainDateObj = dateObj.toObject();

            return futureTimes.length > 0
              ? { ...plainDateObj, showtimes: futureTimes }
              : null;
          })
          .filter(Boolean);

        const plainTheaterObj = theater.toObject();

        return cleanedDates.length > 0
          ? { ...plainTheaterObj, dates: cleanedDates }
          : null;
      })
      .filter(Boolean);

    show.theaters = futureShowTimes;

    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, show, "Show fetched successfully!!"));
  } catch (error) {
    console.log(`ERROR in fetching a show: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching a show!!"
    );
  }
});

const ShowtimeController = { addShow, getAllShows, getUpcomingShow, getAShow };

export default ShowtimeController;
