/**
 * GitHub Service - Fetch Pull Request Data
 */

const axios = require('axios');

/**
 * Fetch files changed in a Pull Request
 */
async function fetchPRFiles(repoUrl, prNumber, githubToken) {
  if (!githubToken) {
    throw new Error('GitHub token is required');
  }

  const urlParts = repoUrl.replace('https://github.com/', '').split('/');
  if (urlParts.length < 2) {
    throw new Error('Invalid GitHub repository URL');
  }

  const owner = urlParts[0];
  const repo = urlParts[1].replace('.git', '');
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Code-Reviewer',
        Authorization: `Bearer ${githubToken}`
      },
      timeout: 30000,
      maxContentLength: 50 * 1024 * 1024
    });

    // Limit number of files to prevent memory issues
    let files = response.data;
    if (files.length > 100) {
      files = files.slice(0, 100);
    }

    return files.map(file => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch || '',
      raw_url: file.raw_url
    }));

  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Pull request not found');
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('GitHub authentication failed. Invalid or missing token.');
    }
    if (error.response?.status === 422) {
      throw new Error('Invalid request. Check the PR number.');
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('GitHub API timeout. The repository might be too large.');
    }
    if (error.code === 'ENOTFOUND') {
      throw new Error('Network error. Cannot reach GitHub API.');
    }
    throw new Error(`Failed to fetch PR: ${error.message}`);
  }
}

/**
 * Format PR files into text for AI
 */
function formatFilesForAI(files) {
  if (!files || files.length === 0) {
    return 'No files changed in this PR.';
  }

  let output = `Total Files Changed: ${files.length}\n\n`;

  files.forEach((file, index) => {
    output += `${'='.repeat(80)}\n`;
    output += `FILE ${index + 1}: ${file.filename}\n`;
    output += `Status: ${file.status} | +${file.additions} -${file.deletions}\n`;
    output += `${'='.repeat(80)}\n\n`;
    output += file.patch
      ? `Changes:\n${file.patch}\n\n`
      : `(Binary file or no diff available)\n\n`;
  });

  return output;
}

module.exports = {
  fetchPRFiles,
  formatFilesForAI
};
