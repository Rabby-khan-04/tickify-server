import mongoose, { Schema } from "mongoose";
const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String },
  },
  { timestamps: true, versionKey: false },
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
