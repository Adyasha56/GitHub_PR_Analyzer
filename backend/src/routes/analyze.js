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
const { analyzeWithAI } = require('../services/ai');

/**
 * POST /api/analyze-pr
 * Start a new PR analysis
 * 
 * Body: { repoUrl: string, prNumber: number }
 * Returns: { taskId, analysisId, status, statusUrl }
 */
router.post('/analyze-pr', requireAuth, async (req, res) => {
  try {
    const { repoUrl, prNumber } = req.body;

    // Validation
    if (!repoUrl || !prNumber) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['repoUrl', 'prNumber']
      });
    }

    // Validate GitHub URL
    if (!repoUrl.includes('github.com')) {
      return res.status(400).json({
        error: 'Invalid GitHub repository URL'
      });
    }

    // Get authenticated user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Create unique task ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create analysis record in database
    const analysis = await Analysis.create({
      taskId,
      userId: user.clerkId,
      repoUrl,
      prNumber: parseInt(prNumber),
      status: 'pending',
      aiProvider: process.env.AI_PROVIDER || 'gemini'
    });

    console.log(`[API] ✓ Created analysis ${taskId} for ${user.email}`);

    // Start analysis in background (non-blocking)
    processAnalysis(taskId, repoUrl, prNumber, user).catch(err => {
      console.error(`[API] ✗ Background analysis failed for ${taskId}:`, err.message);
    });

    // Return immediately - don't wait for analysis to complete
    res.status(202).json({
      message: 'Analysis started successfully',
      taskId,
      analysisId: analysis._id,
      status: 'pending',
      statusUrl: `/api/status/${taskId}`
    });

  } catch (error) {
    console.error('[API] Error starting analysis:', error);
    res.status(500).json({
      error: 'Failed to start analysis',
      message: error.message
    });
  }
});

/**
 * Background processing function
 * This runs asynchronously after the API returns
 */
async function processAnalysis(taskId, repoUrl, prNumber, user) {
  try {
    console.log(`[Analysis] 🔄 Starting ${taskId}`);

    // Update status to processing
    await Analysis.findOneAndUpdate(
      { taskId },
      { status: 'processing' }
    );

    // Step 1: Fetch PR files from GitHub
    console.log(`[Analysis] 📥 Fetching PR files...`);
    const files = await fetchPRFiles(
      repoUrl,
      prNumber,
      process.env.GITHUB_TOKEN
    );

    if (!files || files.length === 0) {
      throw new Error('No files found in PR');
    }

    console.log(`[Analysis] ✓ Found ${files.length} files`);

    // Step 2: Format files for AI
    const formattedFiles = formatFilesForAI(files);

    // Step 3: Analyze with AI
    console.log(`[Analysis] 🤖 Analyzing with AI...`);
    const results = await analyzeWithAI(formattedFiles);

    // Step 4: Count issues found
    const issuesFound = countIssues(results);

    // Step 5: Update analysis with results
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

    // Step 6: Increment user's analysis count
    await user.incrementAnalysisCount();

    console.log(`[Analysis] ✅ Completed ${taskId} - Found ${issuesFound} issues in ${files.length} files`);

  } catch (error) {
    console.error(`[Analysis] ❌ Failed ${taskId}:`, error.message);

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

/**
 * Helper function to count total issues
 */
function countIssues(results) {
  let count = 0;
  
  if (!results) return 0;
  
  // Count code review issues
  if (results.codeReview && Array.isArray(results.codeReview.issues)) {
    count += results.codeReview.issues.length;
  }
  
  // Count security vulnerabilities
  if (results.securityReview && Array.isArray(results.securityReview.vulnerabilities)) {
    count += results.securityReview.vulnerabilities.length;
  }
  
  // Count suggestions
  if (Array.isArray(results.suggestions)) {
    count += results.suggestions.length;
  }
  
  return count;
}

/**
 * GET /api/status/:taskId
 * Get status of a specific analysis
 * 
 * Returns: Full analysis object with results
 */
router.get('/status/:taskId', requireAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = req.user;

    // Find analysis for this user
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

    // Return analysis data
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
    console.error('[API] Error fetching status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analysis status',
      message: error.message 
    });
  }
});

/**
 * GET /api/analyses
 * Get all analyses for the authenticated user
 * 
 * Query params: ?limit=50&skip=0
 * Returns: { analyses: [], total, hasMore }
 */
router.get('/analyses', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    // Get user's analyses
    const analyses = await Analysis.find({ userId: user.clerkId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-results'); // Exclude full results for performance

    // Get total count
    const total = await Analysis.countDocuments({ userId: user.clerkId });

    res.json({
      analyses,
      total,
      limit,
      skip,
      hasMore: skip + limit < total
    });

  } catch (error) {
    console.error('[API] Error fetching analyses:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analyses',
      message: error.message 
    });
  }
});

/**
 * GET /api/analysis/:id
 * Get specific analysis by MongoDB ID (with full results)
 * 
 * Returns: Complete analysis object
 */
router.get('/analysis/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    // Find analysis
    const analysis = await Analysis.findOne({
      _id: id,
      userId: user.clerkId
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);

  } catch (error) {
    console.error('[API] Error fetching analysis:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analysis',
      message: error.message 
    });
  }
});

/**
 * GET /api/stats
 * Get user statistics and dashboard data
 * 
 * Returns: User info, stats, recent activity
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // Calculate statistics
    const totalAnalyses = await Analysis.countDocuments({ 
      userId: user.clerkId 
    });
    
    const completedAnalyses = await Analysis.countDocuments({
      userId: user.clerkId,
      status: 'completed'
    });
    
    const failedAnalyses = await Analysis.countDocuments({
      userId: user.clerkId,
      status: 'failed'
    });
    
    const processingAnalyses = await Analysis.countDocuments({
      userId: user.clerkId,
      status: { $in: ['pending', 'processing'] }
    });

    // Get unique repositories count
    const uniqueRepos = await Analysis.distinct('repoUrl', { 
      userId: user.clerkId 
    });

    // Get recent analyses
    const recentAnalyses = await Analysis.find({ 
      userId: user.clerkId 
    })
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
    console.error('[API] Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/analysis/:id
 * Delete an analysis (optional feature)
 * 
 * Returns: { message: 'Success' }
 */
router.delete('/analysis/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    // Find and delete
    const analysis = await Analysis.findOneAndDelete({
      _id: id,
      userId: user.clerkId
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    console.log(`[API] 🗑️  Deleted analysis ${id} for ${user.email}`);

    res.json({ 
      message: 'Analysis deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('[API] Error deleting analysis:', error);
    res.status(500).json({ 
      error: 'Failed to delete analysis',
      message: error.message 
    });
  }
});

module.exports = router;