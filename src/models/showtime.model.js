import mongoose, { Schema } from "mongoose";

const showtimeSchema = new Schema(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    theaterId: { type: Schema.Types.ObjectId, ref: "Theater", required: true },
    startTime: { type: Date, required: true },
    bookedSeats: { type: [String], default: [] },
  },
  { versionKey: false }
);

const Showtime = mongoose.model("Showtime", showtimeSchema);

export default Showtime;
