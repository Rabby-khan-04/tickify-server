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
      movieId: movie._id,
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

const ShowtimeController = { addShow };

export default ShowtimeController;
