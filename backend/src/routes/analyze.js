/**
 * Analysis Routes
 * All API endpoints for PR analysis
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const { fetchPRFiles, formatFilesForAI } = require('../services/github');
const { analyzeCode } = require('../services/ai');

/**
 * POST /api/analyze-pr
 * Start a new PR analysis
 */
router.post('/analyze-pr', requireAuth, async (req, res) => {
  try {
    const { repoUrl, prNumber } = req.body;

    if (!repoUrl || !prNumber) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['repoUrl', 'prNumber']
      });
    }

    if (!repoUrl.includes('github.com')) {
      return res.status(400).json({
        error: 'Invalid GitHub repository URL'
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const analysis = await Analysis.create({
      taskId,
      userId: user.clerkId,
      repoUrl,
      prNumber: parseInt(prNumber),
      status: 'pending',
      aiProvider: process.env.AI_PROVIDER || 'gemini'
    });

    // Start analysis in background
    processAnalysis(taskId, repoUrl, prNumber, user).catch(() => {});

    res.status(202).json({
      message: 'Analysis started successfully',
      taskId,
      analysisId: analysis._id,
      status: 'pending',
      statusUrl: `/api/status/${taskId}`
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to start analysis',
      message: error.message
    });
  }
});

/**
 * Background processing function
 */
async function processAnalysis(taskId, repoUrl, prNumber, user) {
  try {
    await Analysis.findOneAndUpdate(
      { taskId },
      { status: 'processing' }
    );

    const files = await fetchPRFiles(
      repoUrl,
      prNumber,
      process.env.GITHUB_TOKEN
    );

    if (!files || files.length === 0) {
      throw new Error('No files found in PR');
    }

    const formattedFiles = formatFilesForAI(files);
    const results = await analyzeCode(formattedFiles);
    const issuesFound = countIssues(results);

    await Analysis.findOneAndUpdate(
      { taskId },
      {
        status: 'completed',
        results,
        filesAnalyzed: files.length,
        issuesFound,
        completedAt: new Date()
      }
    );

    await user.incrementAnalysisCount();

  } catch (error) {
    await Analysis.findOneAndUpdate(
      { taskId },
      {
        status: 'failed',
        error: error.message,
        completedAt: new Date()
      }
    );
  }
}

/**
 * Helper function to count total issues
 */
function countIssues(results) {
  let count = 0;
  if (!results) return 0;

  if (results.codeReview && Array.isArray(results.codeReview.issues)) {
    count += results.codeReview.issues.length;
  }
  if (results.securityReview && Array.isArray(results.securityReview.vulnerabilities)) {
    count += results.securityReview.vulnerabilities.length;
  }
  if (Array.isArray(results.suggestions)) {
    count += results.suggestions.length;
  }

  return count;
}

/**
 * GET /api/status/:taskId
 */
router.get('/status/:taskId', requireAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = req.user;

    const analysis = await Analysis.findOne({
      taskId,
      userId: user.clerkId
    });

    if (!analysis) {
      return res.status(404).json({
        error: 'Analysis not found',
        message: 'This analysis does not exist or does not belong to you'
      });
    }

    res.json({
      taskId: analysis.taskId,
      status: analysis.status,
      repoUrl: analysis.repoUrl,
      repoName: analysis.repoName,
      repoOwner: analysis.repoOwner,
      prNumber: analysis.prNumber,
      filesAnalyzed: analysis.filesAnalyzed,
      issuesFound: analysis.issuesFound,
      aiProvider: analysis.aiProvider,
      results: analysis.results,
      error: analysis.error,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch analysis status',
      message: error.message
    });
  }
});

/**
 * GET /api/analyses
 */
router.get('/analyses', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const analyses = await Analysis.find({ userId: user.clerkId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-results');

    const total = await Analysis.countDocuments({ userId: user.clerkId });

    res.json({
      analyses,
      total,
      limit,
      skip,
      hasMore: skip + limit < total
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch analyses',
      message: error.message
    });
  }
});

/**
 * GET /api/analysis/:id
 */
router.get('/analysis/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    const analysis = await Analysis.findOne({
      _id: id,
      userId: user.clerkId
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch analysis',
      message: error.message
    });
  }
});

/**
 * GET /api/stats
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const totalAnalyses = await Analysis.countDocuments({ userId: user.clerkId });
    const completedAnalyses = await Analysis.countDocuments({ userId: user.clerkId, status: 'completed' });
    const failedAnalyses = await Analysis.countDocuments({ userId: user.clerkId, status: 'failed' });
    const processingAnalyses = await Analysis.countDocuments({ userId: user.clerkId, status: { $in: ['pending', 'processing'] } });
    const uniqueRepos = await Analysis.distinct('repoUrl', { userId: user.clerkId });

    const recentAnalyses = await Analysis.find({ userId: user.clerkId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('repoName repoOwner prNumber status createdAt issuesFound filesAnalyzed');

    res.json({
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        memberSince: user.createdAt
      },
      stats: {
        totalAnalyses,
        completedAnalyses,
        failedAnalyses,
        processingAnalyses,
        uniqueRepos: uniqueRepos.length,
        analysisCount: user.analysisCount
      },
      recentActivity: recentAnalyses
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * DELETE /api/analysis/:id
 */
router.delete('/analysis/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    const analysis = await Analysis.findOneAndDelete({
      _id: id,
      userId: user.clerkId
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      message: 'Analysis deleted successfully',
      deletedId: id
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete analysis',
      message: error.message
    });
  }
});

module.exports = router;
