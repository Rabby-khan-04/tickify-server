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
        dateTiem.showtimes = dateTiem.showtimes.map(
          (time) => new Date(`${dateTiem.date}T${time}`)
        );
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

const getAllUpcomingShow = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const rawShows = await Showtime.find()
      .populate({
        path: "movie",
        select: "-casts",
      })
      .populate("theaters.theaterId");

    const shows = rawShows
      .map((show) => {
        const cleanTheater = show.theaters
          .map((theater) => {
            const cleanedDate = theater.dates
              .map((dateObj) => {
                const futureShowTimes = dateObj.showtimes.filter(
                  (dateTime) => dateTime > now
                );

                const dateObjPlain = dateObj.toObject();

                return futureShowTimes.length > 0
                  ? { ...dateObjPlain, showtimes: futureShowTimes }
                  : null;
              })
              .filter(Boolean);

            const theaterPlainObj = theater.toObject();

            return cleanedDate.length > 0
              ? { ...theaterPlainObj, dates: cleanedDate }
              : null;
          })
          .filter(Boolean);

        const showPlainObj = show.toObject();

        return { ...showPlainObj, theaters: cleanTheater };
      })
      .filter((show) => show.theaters.length > 0);

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

const ShowtimeController = { addShow, getAllShows, getAllUpcomingShow };

export default ShowtimeController;
