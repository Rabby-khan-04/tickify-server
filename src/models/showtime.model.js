import mongoose, { Schema } from "mongoose";

const showtimeSchema = new Schema(
  {
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    theaters: [
      {
        _id: false,
        theaterId: {
          type: Schema.Types.ObjectId,
          ref: "Theater",
          required: true,
        },
        price: { type: Number, required: true },
        dates: [
          {
            _id: false,
            date: { type: String, required: true },
            showtimes: [
              {
                _id: false,
                time: { type: Date, required: true },
                bookedSeats: { type: [String], default: [] },
              },
            ],
          },
        ],
      },
    ],
  },
  { versionKey: false }
);

// showtimeSchema.virtual("movie", {
//   ref: "Movie",
//   localField: "movieId",
//   foreignField: "_id",
//   justOne: true,
// });

// showtimeSchema.set("toObject", { virtuals: true });
// showtimeSchema.set("toJSON", { virtuals: true });

const Showtime = mongoose.model("Showtime", showtimeSchema);

export default Showtime;
