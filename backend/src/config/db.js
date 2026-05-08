// config/db.js - MongoDB Database Connection
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod = null;

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGO_URI;

    // Use memory server if local mongodb is specified and fails, or just default to memory server for dev
    if (!dbUri || dbUri.includes("localhost") || dbUri.includes("127.0.0.1")) {
      console.log("Starting in-memory MongoDB server...");
      mongod = await MongoMemoryServer.create();
      dbUri = mongod.getUri();
      process.env.MONGO_URI = dbUri; // Override so other modules can access if needed
    }

    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;