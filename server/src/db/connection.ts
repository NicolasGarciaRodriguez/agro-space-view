import mongoose from "mongoose";

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/agrospace";

  console.log("🔍 URI:", uri.includes("mongodb+srv") ? "🔴 ATLAS" : "🟢 LOCAL");

  await mongoose.connect(uri);
  isConnected = true;
}

export async function disconnectDatabase() {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
}
