import mongoose, { Schema } from "mongoose";

const screenSchema = new Schema(
  {
    name: { type: String, required: true },
    totalSeat: { type: Number, required: true },
    theaterId: { type: Schema.Types.ObjectId, ref: "Theater" },
  },
  { versionKey: false }
);

const Screen = mongoose.model("Screen", screenSchema);

export default Screen;
