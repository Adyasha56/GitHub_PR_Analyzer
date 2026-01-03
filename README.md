# GitHub PR Analyzer

AI-powered code review system that analyzes GitHub Pull Requests using Google Gemini and LangChain.

**Live Demo:** https://github-pr-analyzer.onrender.com

## Features

- **Automated PR Analysis** - Fetches and analyzes GitHub Pull Request changes
- **AI-Powered Review** - Google Gemini 2.0 Flash via LangChain agent framework
- **Async Processing** - Non-blocking task execution with status tracking
- **Intelligent Feedback** - Identifies bugs, style issues, and performance problems
- **Robust & Reliable** - Retry logic, input validation, error handling

---

## Tech Stack

- **Runtime:** Node.js 18+ with Express.js
- **AI Framework:** LangChain.js with Google Gemini 2.0 Flash
- **Storage:** In-memory Map (tasks cleared on restart)
- **GitHub API:** Axios for fetching PR data

---

## Quick Start

```bash
# Install dependencies
npm install

# Configure .env file
PORT=3000
GOOGLE_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token

# Start server
npm start          # Production
npm run dev        # Development with auto-reload
```

**Get API Keys:**
- GitHub Token: https://github.com/settings/tokens (needs `repo` or `public_repo` scope)
- Gemini API: https://ai.google.dev/

---

## API Endpoints

### 1. Start Analysis
```bash
POST /analyze-pr
Content-Type: application/json

{
  "repo_url": "https://github.com/owner/repo",
  "pr_number": 123
}

# Response (202 Accepted)
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status_url": "/status/{task_id}",
  "results_url": "/results/{task_id}"
}
```

### 2. Check Status
```bash
GET /status/:task_id

# Response
{
  "status": "processing",  # pending | processing | completed | failed
  "created_at": "2026-01-03T10:30:00.000Z"
}
```

### 3. Get Results
```bash
GET /results/:task_id

# Response (200 OK when completed)
{
  "status": "completed",
  "results": {
    "files": [
      {
        "name": "src/utils/helper.js",
        "issues": [
          {
            "type": "bug",
            "line": 42,
            "severity": "high",
            "description": "Potential null pointer exception",
            "suggestion": "Add null check: if (!user || !user.profile) return null;"
          }
        ]
      }
    ],
    "summary": {
      "total_issues": 12,
      "bugs": 5,
      "style_issues": 4,
      "performance_issues": 3
    }
  }
}
```

---

## Usage Example

### Using Live Deployment (Render)

```bash
# 1. Start analysis
curl -X POST https://github-pr-analyzer.onrender.com/analyze-pr \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react", "pr_number": 28000}'

# 2. Check status
curl https://github-pr-analyzer.onrender.com/status/{task_id}

# 3. Get results
curl https://github-pr-analyzer.onrender.com/results/{task_id}
```

### Using Local Development

```bash
# 1. Start analysis
curl -X POST http://localhost:3000/analyze-pr \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react", "pr_number": 28000}'

# 2. Check status
curl http://localhost:3000/status/{task_id}

# 3. Get results
curl http://localhost:3000/results/{task_id}
```

---

## Design Decisions & Trade-offs

### 1. **Node.js Instead of Python**
- **Assignment Required:** Python/FastAPI/Celery
- **What I Built:** Node.js/Express
- **Why:** Faster MVP development, familiar ecosystem
- **Impact:** ❌ Doesn't match assignment stack | ✅ Working prototype

### 2. **In-Memory Storage Instead of Database**
- **Assignment Suggested:** Redis/PostgreSQL
- **What I Built:** JavaScript Map
- **Why:** Zero setup, showcasing for demo
- **Impact:** ❌ **Data lost on restart** | ✅ Simple, no dependencies

### 3. **Promises Instead of Job Queue**
- **Assignment Expected:** Celery/BullMQ
- **What I Built:** Async/await promises
- **Why:** Native async sufficient for MVP
- **Impact:** ❌ No retry queue | ✅ Simple architecture

### 4. **LangChain Agent Framework**
- **Why:** Meets "AI agent framework" requirement
- **Impact:** ✅ Structured AI interactions, provider-agnostic

### 5. **Retry Logic + Input Validation**
- **Features:** 3 retries with exponential backoff, regex validation, sanitization
- **Impact:** ✅ Handles API failures gracefully, prevents injection attacks

---

## Known Limitations

### Critical
1. **No Data Persistence** - Tasks lost on server restart (in-memory storage)
2. **Wrong Tech Stack** - Built with Node.js, not Python/FastAPI/Celery
3. **No Automated Tests** - No unit/integration/E2E tests

### Scalability
4. **Single Server Only** - Can't distribute across multiple instances
5. **No Job Queue** - Tasks lost if server crashes mid-processing
6. **File Limits** - Max 100 files per PR, 50MB response, 30s timeout

### Security
7. **No Rate Limiting** - Vulnerable to abuse
8. **No Authentication** - Public API endpoints
9. **Basic Token Handling** - Tokens in env vars only

---

## 🚀 Future Improvements

**High Priority:**
- [ ] Add MongoDB/PostgreSQL for persistence
- [ ] Implement BullMQ/Celery job queue
- [ ] Add automated tests (Jest/Mocha)

**Medium Priority:**
- [ ] API rate limiting (express-rate-limit)
- [ ] Webhook support for completion notifications
- [ ] API key authentication
- [ ] Enhanced AI analysis (security vulnerabilities, complexity metrics)

**Low Priority:**
- [ ] Caching layer for PR data
- [ ] Multi-model support (OpenAI, Claude)
- [ ] Web dashboard UI
- [ ] Metrics & monitoring (Prometheus)

---

## Troubleshooting

### "GitHub authentication failed"
- Generate token at https://github.com/settings/tokens
- Add to `.env`: `GITHUB_TOKEN=your_token_here`
- Restart server

### "Invalid API key"
- Get Gemini key from https://ai.google.dev/
- Add to `.env`: `GOOGLE_API_KEY=your_key_here`
- Verify in logs: `Gemini API: ✓ Configured`

### "Pull request not found"
- Verify PR exists: `https://github.com/owner/repo/pull/NUMBER`
- Check token has `repo` scope for private repos

### "Task not found"
- Tasks deleted after 1 hour (auto-cleanup)
- Server restart clears all tasks

### "GitHub API timeout"
- PRs with 100+ files limited to first 100
- Very large PRs may fail (30s timeout)

---

## Architecture

```
Client → POST /analyze-pr
         ↓
    Express Server (validates input)
         ↓
    Task Manager (creates task_id)
         ↓
    Background Worker (async)
         ├─→ GitHub Service (fetch PR files)
         └─→ LangChain Agent (Gemini analysis)
              ↓
    Task Manager (stores results)
         ↓
Client ← GET /results/:task_id
```

---

## Support

1. Check [Troubleshooting](#-troubleshooting) section
2. Review server logs for errors
3. Verify `.env` configuration
4. Ensure API keys have correct permissions

---

**Note:** This is an MVP/demo project. For production use, implement database persistence, job queuing, and automated testing from the Future Improvements section.
