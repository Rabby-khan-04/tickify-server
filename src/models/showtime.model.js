import mongoose, { Schema } from "mongoose";

const showtimeSchema = new Schema(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    theaters: [
      {
        theaterId: {
          type: Schema.Types.ObjectId,
          ref: "Theater",
          required: true,
        },
        dates: [
          {
            date: { type: String, required: true },
            showtimes: [Date],
          },
        ],
      },
    ],
    bookedSeats: { type: [String], default: [] },
  },
  { versionKey: false }
);

const Showtime = mongoose.model("Showtime", showtimeSchema);

export default Showtime;
