import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const uri = `${process.env.MONGODB_URI}/${DB_NAME}`;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(uri, clientOptions);
    console.log(
      `\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`MONGODB connection ERROR: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
