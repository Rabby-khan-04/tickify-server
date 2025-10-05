import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    showtimeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Showtime",
    },
    movieId: { type: Schema.Types.ObjectId, required: true, ref: "Movie" },
    seats: [String],
    date: { type: String, required: true },
    time: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "booked" },
    paymentStatus: { type: String, default: "pending" },
    paymentLink: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "bookedAt", updatedAt: "updatedAt" },
    versionKey: false,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
