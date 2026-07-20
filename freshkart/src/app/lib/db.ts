import mongoose from "mongoose"

const mongodbUrl = process.env.MONGODB_URL

if(!mongodbUrl){
    throw new Error("MONGODB_URL is not defined in the environment variables")
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}


const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Optional configuration for better connection pooling
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(mongodbUrl, opts);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

export default connectDB;