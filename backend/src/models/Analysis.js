/**
 * Analysis Model
 * Stores PR analysis results
 */

const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  repoUrl: {
    type: String,
    required: true
  },
  repoName: {
    type: String,
    default: ''
  },
  repoOwner: {
    type: String,
    default: ''
  },
  prNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  aiProvider: {
    type: String,
    default: ''
  },
  filesAnalyzed: {
    type: Number,
    default: 0
  },
  issuesFound: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Compound index for efficient user queries
analysisSchema.index({ userId: 1, createdAt: -1 });

// Extract repo name and owner from URL before saving
analysisSchema.pre('save', function(next) {
  if (this.repoUrl && (!this.repoName || !this.repoOwner)) {
    try {
      const urlParts = this.repoUrl.replace('https://github.com/', '').split('/');
      this.repoOwner = urlParts[0] || '';
      this.repoName = (urlParts[1] || '').replace('.git', '');
    } catch (e) {
      // Ignore parsing errors
    }
  }
  next();
});

// Static method to get user's analysis count
analysisSchema.statics.getCountByUser = async function(userId) {
  return this.countDocuments({ userId });
};

// Static method to get unique repos count for user
analysisSchema.statics.getUniqueReposCount = async function(userId) {
  const result = await this.distinct('repoUrl', { userId });
  return result.length;
};

// Static method to get user's recent analyses
analysisSchema.statics.getRecentByUser = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-results'); // Exclude full results for list view
};

module.exports = mongoose.model('Analysis', analysisSchema);
