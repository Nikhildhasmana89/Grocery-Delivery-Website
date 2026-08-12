import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error(
    "MONGODB_URL is not defined in environment variables",
  );
}

const cached: MongooseCache =
  global.mongooseCache ?? {
    conn: null,
    promise: null,
  };

global.mongooseCache = cached;

const connectDB = async (): Promise<typeof mongoose> => {
  // Already connected
  if (
    cached.conn &&
    mongoose.connection.readyState === 1
  ) {
    return cached.conn;
  }

  // Connection is currently being established
  if (cached.promise) {
    return cached.promise;
  }

  console.log("🔌 Creating MongoDB connection...");

  cached.promise = mongoose
    .connect(MONGODB_URL, {
      bufferCommands: false,

      // Connection pool
      maxPoolSize: 10,
      minPoolSize: 2,

      // Don't wait forever when MongoDB is unavailable
      serverSelectionTimeoutMS: 5000,

      // Socket timeout
      socketTimeoutMS: 45000,
    })
    .then((mongooseInstance) => {
      console.log("✅ MongoDB connected");

      cached.conn = mongooseInstance;

      return mongooseInstance;
    })
    .catch((error) => {
      console.error(
        "❌ MongoDB connection failed:",
        error,
      );

      cached.promise = null;
      cached.conn = null;

      throw error;
    });

  return cached.promise;
};

export default connectDB;