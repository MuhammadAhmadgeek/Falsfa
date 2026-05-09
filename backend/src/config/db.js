// config/db.js - MongoDB Database Connection
// Supports both a real MongoDB URI and an in-memory server for development.

const mongoose = require("mongoose");

let mongoServer = null; // Holds the MongoMemoryServer instance

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    // Attempt connection to the configured URI first
    try {
      const conn = await mongoose.connect(dbUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`⚠️  Could not connect to ${dbUri}: ${err.message}`);
      console.log("🔄 Falling back to in-memory MongoDB...");
    }

    // Fallback: use mongodb-memory-server for development
    const { MongoMemoryServer } = require("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();

    const conn = await mongoose.connect(memoryUri);
    console.log(`MongoDB In-Memory Connected: ${conn.connection.host}`);
    console.log("⚡ Note: Data will be lost when the server restarts.");
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;