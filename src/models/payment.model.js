import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, required: true, ref: "Booking" },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    amount: { type: Number, required: true },
    status: { type: String, default: "failed" },
    paymentGatewayId: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
