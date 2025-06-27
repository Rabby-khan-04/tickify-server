import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`ERROR: ${error}`);
      throw error;
    });

    app.listen(port, () => {
      console.log(`Server is running on PORT: ${port}`);
    });
  })
  .catch((err) => {
    console.log(`MongoDB Connection Failed! ERROR: ${err}`);
  });
