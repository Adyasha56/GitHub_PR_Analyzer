/**
 * API Routes - The 3 Required Endpoints
 * 1. POST /analyze-pr - Start analysis
 * 2. GET /status/:task_id - Check progress
 * 3. GET /results/:task_id - Get final results
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Import services
const { fetchPRFiles, formatFilesForAI } = require('../services/github');
const { analyzeCode } = require('../services/ai');
const taskManager = require('../utils/taskManager');

// Create router
const router = express.Router();

/**
 * ENDPOINT 1: POST /analyze-pr
 * Starts the PR analysis process asynchronously
 */
router.post('/analyze-pr', async (req, res) => {
  try {
    // Validate request body
    const { repo_url, pr_number, github_token } = req.body;

    if (!repo_url || !pr_number) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['repo_url', 'pr_number'],
        example: {
          repo_url: 'https://github.com/owner/repo',
          pr_number: 123,
          github_token: 'optional_token_here'
        }
      });
    }

    // Validate PR number
    if (typeof pr_number !== 'number' || pr_number < 1) {
      return res.status(400).json({
        error: 'Invalid pr_number. Must be a positive integer.'
      });
    }

    // Generate unique task ID
    const taskId = uuidv4();

    // Create task in storage
    taskManager.createTask(taskId, {
      repo_url,
      pr_number,
      github_token: github_token ? '***' : null // Don't store actual token
    });

    console.log(`[API] Created task ${taskId} for ${repo_url} PR #${pr_number}`);

    // Start processing in background
    processAnalysis(taskId, repo_url, pr_number, github_token)
      .catch(error => {
        console.error(`[API] Background processing error for task ${taskId}:`, error.message);
      });

    // Return immediately with task ID
    res.status(202).json({
      message: 'Analysis started',
      task_id: taskId,
      status: 'pending',
      check_status_at: `/status/${taskId}`,
      get_results_at: `/results/${taskId}`
    });

  } catch (error) {
    console.error('[API] Error in /analyze-pr:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * ENDPOINT 2: GET /status/:task_id
 * Check the current status of an analysis task
 */
router.get('/status/:task_id', (req, res) => {
  try {
    const { task_id } = req.params;

    const status = taskManager.getStatus(task_id);

    if (status.error) {
      return res.status(404).json(status);
    }

    res.json(status);

  } catch (error) {
    console.error('[API] Error in /status:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * ENDPOINT 3: GET /results/:task_id
 * Get the final analysis results
 */
router.get('/results/:task_id', (req, res) => {
  try {
    const { task_id } = req.params;

    const results = taskManager.getResults(task_id);

    if (results.error) {
      return res.status(404).json(results);
    }

    // If still processing
    if (results.status === 'pending' || results.status === 'processing') {
      return res.status(202).json(results);
    }

    // If failed
    if (results.status === 'failed') {
      return res.status(500).json(results);
    }

    // Success - return full results
    res.json(results);

  } catch (error) {
    console.error('[API] Error in /results:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Background Processing Function
 * This runs asynchronously after returning the task_id
 */
async function processAnalysis(taskId, repoUrl, prNumber, githubToken) {
  try {
    // Update status to processing
    taskManager.updateStatus(taskId, 'processing');
    console.log(`[Process] Starting analysis for task ${taskId}`);

    // Step 1: Fetch PR files from GitHub
    console.log(`[Process] Fetching PR from GitHub...`);
    const files = await fetchPRFiles(repoUrl, prNumber, githubToken);

    if (files.length === 0) {
      throw new Error('No files found in this PR');
    }

    // Step 2: Format files for AI
    const formattedCode = formatFilesForAI(files);

    // Step 3: Analyze with AI
    console.log(`[Process] Sending to AI for analysis...`);
    const analysis = await analyzeCode(formattedCode, {
      repo_url: repoUrl,
      pr_number: prNumber
    });

    // Step 4: Store results
    taskManager.setResults(taskId, analysis);
    console.log(`[Process] Analysis complete for task ${taskId}`);

  } catch (error) {
    console.error(`[Process] Analysis failed for task ${taskId}:`, error.message);
    taskManager.setError(taskId, error.message);
  }
}

// Export the router
module.exports = router;