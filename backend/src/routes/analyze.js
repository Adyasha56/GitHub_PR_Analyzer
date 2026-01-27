/**
 * API Routes
 * POST   /analyze-pr      - Start new PR analysis (auth required)
 * GET    /status/:task_id - Check analysis status
 * GET    /results/:task_id - Get analysis results
 * GET    /analyses        - Get user's analysis history (auth required)
 * GET    /analyses/:id    - Get single analysis (auth required)
 * DELETE /analyses/:id    - Delete analysis (auth required)
 * GET    /stats           - Get user statistics (auth required)
 */

require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getAuth } = require('@clerk/express');

const { fetchPRFiles, formatFilesForAI } = require('../services/github');
const { analyzeCodeWithAgent } = require('../services/langchain');
const { requireAuth, syncUser } = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /analyze-pr
 * Starts a new PR analysis - requires authentication
 */
router.post('/analyze-pr', requireAuth, syncUser, async (req, res) => {
  try {
    const { repo_url, pr_number, github_token } = req.body;
    const userId = req.auth.userId;

    // Validate required fields
    if (!repo_url || !pr_number) {
      return res.status(400).json({
        error: 'repo_url and pr_number are required'
      });
    }

    // Validate PR number
    if (typeof pr_number !== 'number' || pr_number < 1 || pr_number > 999999) {
      return res.status(400).json({
        error: 'pr_number must be a positive number (1-999999)'
      });
    }

    // Validate and sanitize repo_url
    if (typeof repo_url !== 'string' || repo_url.length > 200) {
      return res.status(400).json({
        error: 'repo_url must be a valid string (max 200 characters)'
      });
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    const cleanUrl = repo_url.replace('.git', '').replace(/\/$/, '');

    if (!githubUrlPattern.test(cleanUrl)) {
      return res.status(400).json({
        error: 'repo_url must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)'
      });
    }

    // Validate github_token if provided
    if (github_token && (typeof github_token !== 'string' || github_token.length > 500)) {
      return res.status(400).json({
        error: 'github_token must be a valid string (max 500 characters)'
      });
    }

    const taskId = uuidv4();

    // Create analysis record in MongoDB
    const analysis = await Analysis.create({
      taskId,
      userId,
      repoUrl: cleanUrl,
      prNumber: pr_number,
      status: 'pending',
      aiProvider: process.env.AI_PROVIDER || 'gemini'
    });

    console.log(`[API] Created task ${taskId} for user ${userId}`);

    // Start background processing
    processAnalysis(taskId, cleanUrl, pr_number, github_token, userId)
      .catch(err =>
        console.error(`[Process] Background error:`, err.message)
      );

    res.status(202).json({
      message: 'Analysis started',
      task_id: taskId,
      status_url: `/api/status/${taskId}`,
      results_url: `/api/analyses/${analysis._id}`
    });

  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /status/:task_id
 * Check analysis status - public endpoint
 */
router.get('/status/:task_id', async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ taskId: req.params.task_id })
      .select('taskId status repoUrl repoName repoOwner prNumber createdAt completedAt error');
    
    if (!analysis) {
      return res.status(404).json({
        error: 'Task not found',
        task_id: req.params.task_id
      });
    }

    res.json({
      task_id: analysis.taskId,
      status: analysis.status,
      repo_url: analysis.repoUrl,
      repo_name: analysis.repoName,
      pr_number: analysis.prNumber,
      created_at: analysis.createdAt,
      completed_at: analysis.completedAt,
      error: analysis.error
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /results/:task_id
 * Get analysis results - public endpoint (for backward compatibility)
 */
router.get('/results/:task_id', async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ taskId: req.params.task_id });
    
    if (!analysis) {
      return res.status(404).json({
        error: 'Task not found',
        task_id: req.params.task_id
      });
    }

    if (analysis.status === 'pending' || analysis.status === 'processing') {
      return res.status(202).json({
        task_id: analysis.taskId,
        status: analysis.status,
        message: 'Analysis in progress...'
      });
    }

    if (analysis.status === 'failed') {
      return res.status(500).json({
        task_id: analysis.taskId,
        status: 'failed',
        error: analysis.error
      });
    }

    res.json({
      task_id: analysis.taskId,
      status: analysis.status,
      repo_url: analysis.repoUrl,
      pr_number: analysis.prNumber,
      results: analysis.results,
      files_analyzed: analysis.filesAnalyzed,
      issues_found: analysis.issuesFound,
      completed_at: analysis.completedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /analyses
 * Get user's analysis history - requires authentication
 */
router.get('/analyses', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = parseInt(req.query.skip) || 0;

    const analyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-results'); // Exclude full results for list

    const total = await Analysis.countDocuments({ userId });

    res.json({
      analyses: analyses.map(a => ({
        id: a._id,
        task_id: a.taskId,
        repo_url: a.repoUrl,
        repo_name: a.repoName,
        repo_owner: a.repoOwner,
        pr_number: a.prNumber,
        status: a.status,
        issues_found: a.issuesFound,
        files_analyzed: a.filesAnalyzed,
        created_at: a.createdAt,
        completed_at: a.completedAt
      })),
      total,
      limit,
      skip
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /analyses/:id
 * Get single analysis with full results - requires authentication
 */
router.get('/analyses/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const analysis = await Analysis.findOne({ 
      _id: req.params.id,
      userId 
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      id: analysis._id,
      task_id: analysis.taskId,
      repo_url: analysis.repoUrl,
      repo_name: analysis.repoName,
      repo_owner: analysis.repoOwner,
      pr_number: analysis.prNumber,
      status: analysis.status,
      results: analysis.results,
      error: analysis.error,
      files_analyzed: analysis.filesAnalyzed,
      issues_found: analysis.issuesFound,
      ai_provider: analysis.aiProvider,
      created_at: analysis.createdAt,
      completed_at: analysis.completedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /analyses/:id
 * Delete an analysis - requires authentication
 */
router.delete('/analyses/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const analysis = await Analysis.findOneAndDelete({ 
      _id: req.params.id,
      userId 
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /stats
 * Get user statistics - requires authentication
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const [totalAnalyses, uniqueRepos, recentAnalyses] = await Promise.all([
      Analysis.countDocuments({ userId }),
      Analysis.distinct('repoUrl', { userId }).then(repos => repos.length),
      Analysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('repoName prNumber status createdAt')
    ]);

    // Count by status
    const statusCounts = await Analysis.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = {};
    statusCounts.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      total_analyses: totalAnalyses,
      unique_repos: uniqueRepos,
      completed: statusMap.completed || 0,
      failed: statusMap.failed || 0,
      pending: (statusMap.pending || 0) + (statusMap.processing || 0),
      recent_analyses: recentAnalyses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Background Worker
 * Process analysis and save to MongoDB
 */
async function processAnalysis(taskId, repoUrl, prNumber, githubToken, userId) {
  try {
    // Update status to processing
    await Analysis.findOneAndUpdate(
      { taskId },
      { status: 'processing' }
    );
    console.log(`[Process] Starting task ${taskId}`);

    // Get GitHub token from request or environment
    const finalGithubToken = githubToken || process.env.GITHUB_TOKEN;

    if (!finalGithubToken) {
      throw new Error('GITHUB_TOKEN missing in environment');
    }

    const files = await fetchPRFiles(
      repoUrl,
      prNumber,
      finalGithubToken
    );

    const formattedCode = formatFilesForAI(files);

    console.log(`[Process] Sending to LangChain agent for analysis`);

    const analysis = await analyzeCodeWithAgent(formattedCode, {
      repo_url: repoUrl,
      pr_number: prNumber
    });

    // Calculate issues count
    let issuesCount = 0;
    if (analysis && analysis.files) {
      analysis.files.forEach(file => {
        if (file.issues) issuesCount += file.issues.length;
      });
    }

    // Update analysis with results
    await Analysis.findOneAndUpdate(
      { taskId },
      {
        status: 'completed',
        results: analysis,
        filesAnalyzed: files.length,
        issuesFound: issuesCount,
        completedAt: new Date()
      }
    );

    // Increment user's analysis count
    if (userId) {
      await User.findOneAndUpdate(
        { clerkId: userId },
        { $inc: { analysisCount: 1 } }
      );
    }

    console.log(`[Process] Completed task ${taskId}`);

  } catch (error) {
    console.error(`[Process] Failed task ${taskId}:`, error.message);
    
    // Update analysis with error
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

module.exports = router;

