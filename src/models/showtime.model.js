import mongoose, { Schema } from "mongoose";

const showtimeSchema = new Schema(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    screenId: { type: Schema.Types.ObjectId, ref: "Screen", required: true },
    startTime: { type: Date, required: true },
    bookedSeats: { type: [String], default: [] },
  },
  { versionKey: false }
);

const Showtime = mongoose.model("Showtime", showtimeSchema);

export default Showtime;
