import mongoose from "mongoose";

// 1. Define global interface for Mongoose cache to eliminate TS errors without using `any`
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
  throw new Error("MONGODB_URL is not defined in the environment variables");
}

// 2. Initialize global cache scoped specifically to prevent Dev Server HMR connection leaks
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

/**
 * Optimized MongoDB Connection Manager for Next.js App Router.
 * Reuses existing active connections, handles connection pooling, and prevents HMR leaks.
 */
const connectDB = async (): Promise<typeof mongoose> => {
  // Check if Mongoose is already connected via readyState (1 = connected, 2 = connecting)
  if (mongoose.connection.readyState === 1 && cached.conn) {
    return cached.conn;
  }

  // If a connection is already established in cache, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is in progress, await the existing promise
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Prevents queries from hanging indefinitely if connection drops
      maxPoolSize: 10,       // Optimized pool size for serverless/edge request concurrency
      serverSelectionTimeoutMS: 5000, // Timeout fast (5s) instead of stalling server response
      socketTimeoutMS: 45000, // Close idle sockets after 45s
    };

    cached.promise = mongoose
      .connect(mongodbUrl, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        // Reset cached promise on failure so subsequent requests can retry
        cached.promise = null;
        console.error("❌ MongoDB connection error:", err.message || err);
        throw new Error("Failed to connect to MongoDB database.");
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};

export default connectDB;