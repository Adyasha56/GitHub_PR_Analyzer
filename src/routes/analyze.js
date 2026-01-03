/**
 * API Routes
 * POST   /analyze-pr
 * GET    /status/:task_id
 * GET    /results/:task_id
 */

require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { fetchPRFiles, formatFilesForAI } = require('../services/github');
const { analyzeCodeWithAgent } = require('../services/langchain');
const taskManager = require('../utils/taskManager');

const router = express.Router();

/**
 * POST /analyze-pr
 */
router.post('/analyze-pr', async (req, res) => {
  try {
    const { repo_url, pr_number, github_token } = req.body;

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

    taskManager.createTask(taskId, {
      repo_url,
      pr_number
    });

    console.log(`[API] Created task ${taskId}`);

    processAnalysis(taskId, repo_url, pr_number, github_token)
      .catch(err =>
        console.error(`[Process] Background error:`, err.message)
      );

    res.status(202).json({
      message: 'Analysis started',
      task_id: taskId,
      status_url: `/status/${taskId}`,
      results_url: `/results/${taskId}`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /status/:task_id
 */
router.get('/status/:task_id', (req, res) => {
  const status = taskManager.getStatus(req.params.task_id);
  if (status.error) return res.status(404).json(status);
  res.json(status);
});

/**
 * GET /results/:task_id
 */
router.get('/results/:task_id', (req, res) => {
  const result = taskManager.getResults(req.params.task_id);
  if (result.error) return res.status(404).json(result);

  if (result.status === 'pending' || result.status === 'processing') {
    return res.status(202).json(result);
  }

  if (result.status === 'failed') {
    return res.status(500).json(result);
  }

  res.json(result);
});

/**
 * Background Worker
 */
async function processAnalysis(taskId, repoUrl, prNumber, githubToken) {
  try {
    taskManager.updateStatus(taskId, 'processing');
    console.log(`[Process] Starting task ${taskId}`);

    // 🔥 KEY FIX: ENV fallback
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

    taskManager.setResults(taskId, analysis);
    console.log(`[Process] Completed task ${taskId}`);

  } catch (error) {
    console.error(`[Process] Failed task ${taskId}:`, error.message);
    taskManager.setError(taskId, error.message);
  }
}

module.exports = router;

