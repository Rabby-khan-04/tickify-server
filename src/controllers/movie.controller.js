import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import axios from "axios";
import ApiResponce from "../utils/ApiResponse.js";
import Movie from "../models/movie.model.js";

const getNowPlayingMovies = asyncHandler(async (req, res) => {
  try {
    const movies = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        },
      }
    );

    if (!movies?.data.results?.length)
      throw new ApiError(status.NOT_FOUND, "Now playing movies not found!!");
    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          movies?.data?.results,
          "Now playing movies fetched successfully!!"
        )
      );
  } catch (error) {
    console.log(`ERROR in fetching now playing movies!!`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching now playing movies!!"
    );
  }
});

const getUpcomingMovies = asyncHandler(async (req, res) => {
  try {
    const movies = await axios.get(
      "https://api.themoviedb.org/3/movie/upcoming",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        },
      }
    );

    if (!movies?.data.results?.length)
      throw new ApiError(status.NOT_FOUND, "Upcoming movies not found!!");
    return res
      .status(status.OK)
      .json(
        new ApiResponce(
          status.OK,
          movies?.data?.results,
          "Upcoming movies fetched successfully!!"
        )
      );
  } catch (error) {
    console.log(`ERROR in fetching upcoming movies!!`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching now playing movies!!"
    );
  }
});

const getAllMovies = asyncHandler(async (req, res) => {
  try {
    const movies = await Movie.find({}).select("-casts -genres");

    if (!movies.length)
      throw new ApiError(status.NOT_FOUND, "Movies not found");

    return res
      .status(status.OK)
      .json(
        new ApiResponce(status.OK, movies, "Movies fetched successfully!!")
      );
  } catch (error) {
    console.log(`ERROR in fetching all movies: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.OK,
      "Something went wrong while fetching movies!!"
    );
  }
});

const getMovieDetails = asyncHandler(async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId)
      throw new ApiError(status.NOT_FOUND, "Movie id is required!!");

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

    return res
      .status(status.OK)
      .json(new ApiResponce(status.OK, movie, "Movie fetched successfully!!"));
  } catch (error) {
    console.log(`ERROR in fetching movies details: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.OK,
      "Something went wrong while fetching movie details!!"
    );
  }
});

const MovieController = {
  getNowPlayingMovies,
  getUpcomingMovies,
  getAllMovies,
  getMovieDetails,
};

export default MovieController;
