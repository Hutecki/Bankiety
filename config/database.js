import mongoose from "mongoose";
let connected = false;
const connectDB = async () => {
  mongoose.set("strictQuery", false);

  // Environment validation
  if (!process.env.MONGODB_URL) {
    console.error("MONGODB_URL environment variable is not set!");
    throw new Error("Database connection string is missing");
  }

  console.log("Attempting to connect to MongoDB...");
  console.log("MongoDB URL present:", !!process.env.MONGODB_URL);

  if (connected) {
    console.log("MongoDb is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    connected = true;
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;
