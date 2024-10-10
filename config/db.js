const mongoose = require("mongoose");

const connectDB = async (retries = 5, wait = 5000) => {
  try {
    // Attempt MongoDB connection with given options
    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 30000, // 30 seconds timeout
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);

    // Retry logic for handling ETIMEOUT or connection errors
    if (retries === 0) {
      console.error("No more retries left, exiting.");
      process.exit(1); // Exit after exhausting retries
    } else {
      console.log(`Retrying connection in ${wait / 1000} seconds...`);
      setTimeout(() => connectDB(retries - 1, wait), wait);
    }
  }
};

// Enable Mongoose debug mode in development environments
if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}

module.exports = connectDB;
