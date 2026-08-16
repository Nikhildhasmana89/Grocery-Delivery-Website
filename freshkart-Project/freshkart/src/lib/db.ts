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
  throw new Error("MONGODB_URL is not defined in environment variables");
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

const connectDB = async (): Promise<typeof mongoose> => {
  // Already connected
  if (cached.conn) {
    return cached.conn;
  }

  // Connection already in progress
  if (cached.promise) {
    return cached.promise;
  }

  console.log("🔌 Connecting to MongoDB...");

  cached.promise = mongoose
    .connect(MONGODB_URL, {
      bufferCommands: false,

      // Connection pool
      maxPoolSize: 10,

      // Keep this 0 unless you specifically need persistent idle connections
      minPoolSize: 0,

      // Fail faster when MongoDB cannot be reached
      serverSelectionTimeoutMS: 5000,

      // Close inactive sockets after 45 seconds
      socketTimeoutMS: 45000,
    })
    .then((mongooseInstance) => {
      console.log("✅ MongoDB connected");
      cached.conn = mongooseInstance;

      return mongooseInstance;
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error);

      cached.promise = null;
      cached.conn = null;

      throw error;
    });

  return cached.promise;
};

export default connectDB;