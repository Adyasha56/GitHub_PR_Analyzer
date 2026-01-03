/**
 * GitHub Service - Fetch Pull Request Data
 * Uses GitHub REST API to get PR file changes
 */

const axios = require('axios');

/**
 * Fetch files changed in a Pull Request
 * @param {string} repoUrl - Full GitHub repo URL (e.g., https://github.com/owner/repo)
 * @param {number} prNumber - Pull request number
 * @param {string} githubToken - Optional GitHub token for authentication
 * @returns {Promise<Array>} Array of file objects with changes
 */
async function fetchPRFiles(repoUrl, prNumber, githubToken = null) {
  try {
    // Extract owner and repo name from URL
    // Example: "https://github.com/facebook/react" -> owner: "facebook", repo: "react"
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    
    if (urlParts.length < 2) {
      throw new Error('Invalid GitHub repository URL. Expected format: https://github.com/owner/repo');
    }

    const owner = urlParts[0];
    const repo = urlParts[1].replace('.git', ''); // Remove .git if present

    // GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;

    console.log(`[GitHub] Fetching PR #${prNumber} from ${owner}/${repo}...`);

    // Make request to GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Code-Reviewer',
        // Add authentication if token provided (increases rate limit)
        ...(githubToken && { 'Authorization': `Bearer ${githubToken}` })
      },
      timeout: 10000 // 10 second timeout
    });

    const files = response.data;

    console.log(`[GitHub] Successfully fetched ${files.length} files`);

    // Filter and format the files
    const processedFiles = files.map(file => ({
      filename: file.filename,
      status: file.status, // 'added', 'modified', 'removed', 'renamed'
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch || '', // The actual code diff
      raw_url: file.raw_url
    }));

    return processedFiles;

  } catch (error) {
    console.error('[GitHub] Error fetching PR:', error.message);

    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        throw new Error('Pull request not found. Check the repository URL and PR number.');
      } else if (status === 401 || status === 403) {
        throw new Error('GitHub authentication failed. Check your token or try without authentication.');
      } else if (status === 422) {
        throw new Error('Invalid request. The PR number might be incorrect.');
      }
    }

    // Network or timeout errors
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw new Error('Network error. Could not reach GitHub API.');
    }

    throw new Error(`Failed to fetch PR from GitHub: ${error.message}`);
  }
}

/**
 * Format PR files into a readable string for AI analysis
 * @param {Array} files - Array of file objects from GitHub
 * @returns {string} Formatted string with all file changes
 */
function formatFilesForAI(files) {
  if (!files || files.length === 0) {
    return 'No files changed in this PR.';
  }

  let formatted = `Total Files Changed: ${files.length}\n\n`;

  files.forEach((file, index) => {
    formatted += `${'='.repeat(80)}\n`;
    formatted += `FILE ${index + 1}: ${file.filename}\n`;
    formatted += `Status: ${file.status} | +${file.additions} -${file.deletions}\n`;
    formatted += `${'='.repeat(80)}\n\n`;

    if (file.patch) {
      formatted += `Changes:\n${file.patch}\n\n`;
    } else {
      formatted += `(Binary file or no diff available)\n\n`;
    }
  });

  return formatted;
}

module.exports = {
  fetchPRFiles,
  formatFilesForAI
};