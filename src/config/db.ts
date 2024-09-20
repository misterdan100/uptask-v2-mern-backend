import mongoose from "mongoose";
import colors from "colors";
import { exit } from "node:process";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL)
    const url = `${connection.connection.host}:${connection.connection.port}`
    console.log(colors.magenta.bold(`MongoDB connected in: ${url}`))
  } catch (error) {
    console.log(colors.red.bold('Error in connection to DB'))
    console.log("[CONNECTDB]", error.message);
    exit(1);
  }
};
