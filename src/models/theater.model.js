import mongoose, { Schema } from "mongoose";

const theaterSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
  },
  { versionKey: false }
);

const Theater = mongoose.model("Theater", theaterSchema);

export default Theater;
