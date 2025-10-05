import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema(
  {
    movieId: { type: Number, required: true },
    title: { type: String, required: true },
    overview: { type: String, default: "" },
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    genres: { type: [{ id: String, name: String }], default: [] },
    casts: { type: [Object], default: [] },
    release_date: { type: String, required: true },
    original_language: { type: String, required: true },
    popularity: { type: Number, required: true },
    tagline: { type: String, default: "" },
    runtime: { type: Number, required: true },
    vote_average: { type: Number, required: true },
    adult: { type: Boolean, required: true },
  },
  { versionKey: false }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
