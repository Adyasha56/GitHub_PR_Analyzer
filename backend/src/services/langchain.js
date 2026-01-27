/**
 * LangChain AI Service - Agent Framework Implementation
 * Uses LangChain.js for autonomous code review
 */

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

/**
 * Analyze code using LangChain Agent Framework
 * This provides autonomous, goal-oriented AI behavior
 */
async function analyzeCodeWithAgent(codeContent, metadata = {}) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[LangChain] Starting agent-based code analysis... (Attempt ${attempt}/${maxRetries})`);

      // Initialize LLM with Google Gemini
      const llm = new ChatGoogleGenerativeAI({
        modelName: "gemini-2.0-flash",
        temperature: 0.3,
        maxOutputTokens: 8192, // Increased for larger PRs
      });

      // Build the analysis prompt
      const prompt = buildAnalysisPrompt(codeContent, metadata);

      // Create messages using LangChain format (agent-style communication)
      const messages = [
        new SystemMessage(`You are an autonomous code review agent.
          Your goal is to analyze pull request changes and identify issues systematically.
          Focus on bugs, style problems, and performance improvements.
          Return only valid JSON in the specified format.
        `),
        new HumanMessage(prompt)
      ];

      // Invoke the LLM through LangChain
      const response = await llm.invoke(messages);

      console.log('[LangChain] ✓ Agent analysis completed successfully');

      // Parse and validate the response
      const analysisResults = parseAIResponse(response.content);

      // Check if parsing was successful
      if (analysisResults.error && attempt < maxRetries) {
        throw new Error('AI returned invalid JSON format');
      }

      return analysisResults;

    } catch (error) {
      lastError = error;
      console.error(`[LangChain] Attempt ${attempt} failed:`, error.message);

      // Don't retry on certain errors
      if (error.message.includes('API key') || error.message.includes('quota')) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`[LangChain] Retrying in ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  console.error('[LangChain] All retry attempts failed');

  if (lastError.message.includes('API key')) {
    throw new Error('Invalid API key. Check your environment variables.');
  }

  throw new Error(`LangChain agent analysis failed: ${lastError.message}`);
}

/**
 * Build the analysis prompt for the agent
 */
function buildAnalysisPrompt(codeContent, metadata) {
  return `You are an expert code reviewer agent analyzing a GitHub Pull Request.

**Repository:** ${metadata.repo_url || 'N/A'}
**PR Number:** ${metadata.pr_number || 'N/A'}

**Your Task:**
As an autonomous agent, analyze the following code changes and identify:

1. **BUGS** - Logic errors, null checks, edge cases, potential crashes
2. **STYLE** - Naming conventions, code organization, best practices violations
3. **PERFORMANCE** - Inefficient algorithms, memory leaks, optimization opportunities

**Code Changes:**
${codeContent.substring(0, 30000)}

**Instructions:**
- Focus on REAL issues, not nitpicks
- For each issue, specify the exact file name and line number
- Be specific and actionable in your suggestions
- Categorize severity as: "high", "medium", or "low"
- Prioritize critical bugs over minor style issues

**CRITICAL: Return ONLY a valid JSON object. No markdown, no code blocks, no extra text.**

Required JSON format:
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
 * Handles common formatting issues from LLM responses
 */
function parseAIResponse(responseText) {
  try {
    let cleaned = responseText.trim();

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.replace(/^json\n?/g, '');

    // Extract JSON object (sometimes AI adds explanatory text)
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    // Parse JSON
    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error('Invalid response structure: missing files array');
    }

    // Generate summary if not provided
    if (!parsed.summary) {
      parsed.summary = generateSummary(parsed.files);
    }

    console.log(`[LangChain] Parsed ${parsed.summary.total_issues} issues across ${parsed.summary.total_files} files`);

    return parsed;

  } catch (error) {
    console.error('[LangChain] Failed to parse response:', error.message);
    console.error('[LangChain] Raw response (first 500 chars):', responseText.substring(0, 500));

    // Return fallback structure instead of crashing
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
 * Generate summary statistics from analyzed files
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
        // Count critical issues
        if (issue.severity === 'high' || issue.severity === 'critical') {
          criticalIssues++;
        }

        // Count by type
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
  analyzeCodeWithAgent
};
