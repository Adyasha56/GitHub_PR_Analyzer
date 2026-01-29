/**
 * MongoDB Database Connection
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");

  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDB;
