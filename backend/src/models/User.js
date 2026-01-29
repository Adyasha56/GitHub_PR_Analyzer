/**
 * User Model
 * Stores user data synced from Clerk
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: false
  },
  name: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  analysisCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Method to increment analysis count
userSchema.methods.incrementAnalysisCount = async function() {
  this.analysisCount += 1;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
