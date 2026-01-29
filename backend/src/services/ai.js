/**
 * AI Service - Google Gemini Code Review
 * Using Gemini 2.0 Flash API
 */

const axios = require('axios');

/**
 * Analyze code using Google Gemini API
 */
async function analyzeCode(codeContent, metadata = {}) {
  const prompt = buildAnalysisPrompt(codeContent, metadata);
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not found in environment variables');
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  try {
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      timeout: 60000
    });

    const responseText = response.data.candidates[0].content.parts[0].text;
    return parseAIResponse(responseText);

  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 400) {
        if (errorData.error?.message?.includes('API key')) {
          throw new Error('Invalid Google API key. Please check your GOOGLE_API_KEY in .env file.');
        }
        throw new Error(`Bad request to Gemini API: ${errorData.error?.message || 'Unknown error'}`);
      } else if (status === 404) {
        throw new Error('Gemini model not found. Make sure gemini-2.0-flash is accessible with your API key.');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      } else if (status === 403) {
        throw new Error('API key does not have permission. Check your Gemini API settings.');
      }
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw new Error('Network error. Could not reach Gemini API. Check your internet connection.');
    }

    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Build the analysis prompt for Gemini
 */
function buildAnalysisPrompt(codeContent, metadata) {
  return `You are an expert code reviewer. Analyze the following Pull Request changes and identify issues.

**Repository:** ${metadata.repo_url || 'N/A'}
**PR Number:** ${metadata.pr_number || 'N/A'}

**Your task:**
1. Identify BUGS (logic errors, null checks, edge cases, potential crashes)
2. Identify STYLE issues (naming conventions, code organization, best practices)
3. Identify PERFORMANCE issues (inefficient algorithms, memory leaks, optimization opportunities)
4. Provide actionable suggestions for each issue

**Code Changes:**
${codeContent.substring(0, 30000)}

**Instructions:**
- Focus on REAL issues, not nitpicks
- For each issue, specify the exact file name and approximate line number
- Be specific and actionable in your suggestions
- Categorize each issue as: "bug", "style", or "performance"
- Prioritize critical bugs over style issues

**CRITICAL: Return ONLY a valid JSON object. No markdown, no code blocks, no extra text. Just this JSON format:**

{
  "files": [
    {
      "name": "filename.js",
      "issues": [
        {
          "type": "bug",
          "line": 42,
          "severity": "high",
          "description": "Clear description of the issue",
          "suggestion": "Specific fix recommendation"
        }
      ]
    }
  ],
  "summary": {
    "total_files": 1,
    "total_issues": 3,
    "critical_issues": 1,
    "bugs": 1,
    "style_issues": 1,
    "performance_issues": 1
  }
}`;
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(responseText) {
  try {
    let cleaned = responseText.trim();

    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.replace(/^json\n?/g, '');

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const parsed = JSON.parse(cleaned);

    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error('Invalid response structure: missing files array');
    }

    if (!parsed.summary) {
      parsed.summary = generateSummary(parsed.files);
    }

    return parsed;

  } catch (error) {
    return {
      files: [],
      summary: {
        total_files: 0,
        total_issues: 0,
        critical_issues: 0,
        parse_error: true
      },
      raw_response: responseText.substring(0, 1000),
      error: `Failed to parse AI response: ${error.message}`
    };
  }
}

/**
 * Generate summary statistics from files
 */
function generateSummary(files) {
  let totalIssues = 0;
  let criticalIssues = 0;
  let bugs = 0;
  let styleIssues = 0;
  let performanceIssues = 0;

  files.forEach(file => {
    if (file.issues && Array.isArray(file.issues)) {
      totalIssues += file.issues.length;

      file.issues.forEach(issue => {
        if (issue.severity === 'high' || issue.severity === 'critical') {
          criticalIssues++;
        }

        if (issue.type === 'bug') bugs++;
        else if (issue.type === 'style') styleIssues++;
        else if (issue.type === 'performance') performanceIssues++;
      });
    }
  });

  return {
    total_files: files.length,
    total_issues: totalIssues,
    critical_issues: criticalIssues,
    bugs,
    style_issues: styleIssues,
    performance_issues: performanceIssues
  };
}

module.exports = {
  analyzeCode
};
