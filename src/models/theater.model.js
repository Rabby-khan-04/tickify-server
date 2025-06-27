import mongoose, { Schema } from "mongoose";

const theaterSchema = new Schema(
  {
    name: { tyep: String, required: true },
    location: { type: String, required: true },
    screens: {
      type: [{ type: Schema.Types.ObjectId, ref: "Screen" }],
      default: [],
    },
  },
  { versionKey: false }
);

const Theater = mongoose.model("Theater", theaterSchema);

export default Theater;
