/**
 * GitHub Auth Resolution
 * Prefers the requesting user's own connected GitHub OAuth token
 * (via Clerk), falls back to the shared GITHUB_TOKEN for users
 * who haven't connected their GitHub account.
 */

const { clerkClient } = require('@clerk/express');

async function getGithubToken(clerkId) {
  try {
    const response = await clerkClient.users.getUserOauthAccessToken(clerkId, 'github');
    const token = response?.data?.[0]?.token;
    if (token) {
      return token;
    }
  } catch (error) {
    console.warn('[github-auth] could not fetch user GitHub token, falling back to shared PAT', {
      clerkId,
      message: error.message
    });
  }

  return process.env.GITHUB_TOKEN;
}

module.exports = {
  getGithubToken
};
