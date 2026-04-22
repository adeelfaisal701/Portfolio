import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

type MongoCache = {
  promise: Promise<typeof mongoose> | null;
};

declare global {
  /** Avoid duplicate connections across hot reloads in development. */
  var __reviewsMongoCache: MongoCache | undefined;
}

export function isMongoReviewsConfigured(): boolean {
  return Boolean(uri?.trim());
}

export async function connectMongoReviews(): Promise<typeof mongoose> {
  const connStr = uri?.trim();
  if (!connStr) throw new Error("MONGODB_URI is not set");

  if (!global.__reviewsMongoCache) {
    global.__reviewsMongoCache = { promise: null };
  }
  const cache = global.__reviewsMongoCache;

  if (mongoose.connection.readyState === 1) return mongoose;

  if (!cache.promise) {
    cache.promise = mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10_000,
      bufferCommands: false,
    });
  }

  try {
    await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }

  return mongoose;
}
