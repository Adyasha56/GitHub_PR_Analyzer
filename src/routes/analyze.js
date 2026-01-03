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
const { analyzeCode } = require('../services/ai');
const taskManager = require('../utils/taskManager');

const router = express.Router();

/**
 * POST /analyze-pr
 */
router.post('/analyze-pr', async (req, res) => {
  try {
    const { repo_url, pr_number, github_token } = req.body;

    if (!repo_url || !pr_number) {
      return res.status(400).json({
        error: 'repo_url and pr_number are required'
      });
    }

    if (typeof pr_number !== 'number' || pr_number < 1) {
      return res.status(400).json({
        error: 'pr_number must be a positive number'
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

    console.log(`[Process] Sending code to AI`);

    const analysis = await analyzeCode(formattedCode, {
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
