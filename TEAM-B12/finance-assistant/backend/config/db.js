import mongoose from "mongoose";

/**
 * Connects to the MongoDB Atlas cluster using the URI in process.env.MONGODB_URI.
 * Exits the process if the connection fails, since the API is useless without a DB.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "Missing MONGODB_URI. Copy .env.example to .env and set your Atlas connection string."
    );
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(uri, {
      // Modern mongoose (8.x) no longer needs useNewUrlParser/useUnifiedTopology,
      // they are defaults now, but kept here as a comment for clarity.
    });

    console.log(`MongoDB Atlas connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error after initial connect:", err.message);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

export default connectDB;
