import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema(
  {
    title: { tyep: String, required: true },
    overview: { tyep: String, required: true },
    poster_path: { tyep: String, required: true },
    backdrop_path: { tyep: String, required: true },
    genres: { type: [{ id: String, name: String }], default: [] },
    casts: { type: [Object], default: [] },
    release_date: { tyep: String, required: true },
    original_language: { tyep: String, required: true },
    popularity: { tyep: Number, required: true },
    tagline: { tyep: String, required: true },
    runtime: { tyep: Number, required: true },
    vote_average: { tyep: Number, required: true },
    adult: { tyep: Boolean, required: true },
  },
  { versionKey: false }
);

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
