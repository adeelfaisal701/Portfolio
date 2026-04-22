import mongoose from "mongoose";

/**
 * @param {string} uri
 */
export async function connectDb(uri) {
  if (!uri || typeof uri !== "string" || uri.trim() === "") {
    throw new Error("MONGODB_URI is missing. Set it in backend/.env");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });
}
