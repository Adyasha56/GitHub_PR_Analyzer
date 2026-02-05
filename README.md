# Previo - AI-Powered PR Reviewer

A full-stack AI-powered code review system that analyzes GitHub Pull Requests using Google Gemini and LangChain. Features a modern Next.js frontend with real-time analysis tracking, dark/light theme support, and comprehensive backend API.

**Backend deployed link:** https://github-pr-analyzer.onrender.com
**Live Demo:** https://git-hub-pr-analyzer.vercel.app/

## Features

### Core Features
- **Automated PR Analysis** - Fetches and analyzes GitHub Pull Request changes with AI insights
- **AI-Powered Review** - Google Gemini 2.0 Flash via LangChain agent framework
- **Multi-Model Support** - Compatible with GPT-4, Gemini, Claude, and Grok
- **Async Processing** - Non-blocking task execution with real-time status tracking
- **Intelligent Feedback** - Identifies bugs, style issues, and performance problems
- **Robust & Reliable** - Retry logic, input validation, comprehensive error handling

### Frontend Features
- **Modern UI** - Built with Next.js 15 and TailwindCSS with purple theme
- **Dark/Light Mode** - Seamless theme switching with localStorage persistence
- **Auto-Extract PR Number** - Automatically extracts PR number from GitHub URLs
- **Copy Response** - One-click copy of analysis results (JSON format)
- **Real-time Updates** - Live status tracking for PR analysis
- **User Authentication** - Secure sign-in/sign-up with Clerk
- **Dashboard** - View analysis history and detailed results
- **Animated UI** - Grid backgrounds, floating orbs, and smooth transitions
- **Responsive Design** - Mobile-friendly interface

### UX Enhancements
- **Smart URL Parser** - Paste full GitHub PR URL and auto-fills PR number
- **Copy to Clipboard** - Export analysis results with a single click
- **Visual Feedback** - Animated gradients, pulsing indicators, and hover effects
- **Theme Toggle** - Purple-themed light and dark modes
- **Smooth Animations** - Staggered fade-in effects and floating elements

---

## Tech Stack

### Backend
- **Runtime:** Node.js 18+ with Express.js
- **AI Framework:** LangChain.js with Google Gemini 2.0 Flash
- **Storage:** MongoDB via Mongoose (persistent task & results storage)
- **GitHub API:** Axios for fetching PR data
- **Port:** 3001

### Frontend
- **Framework:** Next.js 15 (TypeScript)
- **Styling:** TailwindCSS with PostCSS
- **UI Components:** Shadcn/ui
- **Authentication:** Clerk
- **HTTP Client:** Axios
- **Port:** 3000

---

## Project Structure

```
GitHub_PR_Analyzer/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── config/            # Configuration files
│   │   ├── middleware/        # Auth & request middleware
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (AI, GitHub, LangChain)
│   │   └── utils/             # Task manager & helpers
│   └── package.json
│
└── frontend/                   # Next.js web application
    ├── src/
    │   ├── app/               # App router pages
    │   │   ├── (auth)/        # Sign-in/sign-up pages
    │   │   ├── dashboard/     # Main dashboard
    │   │   └── layout.tsx     # Root layout
    │   ├── components/        # React components
    │   └── lib/               # Utilities & API client
    └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- GitHub Token (with `repo` scope)
- Google Gemini API Key
- Clerk Account (for authentication)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure .env file
PORT=3001
GOOGLE_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token

# Start server
npm start          # Production
npm run dev        # Development with auto-reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure .env.local file
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Start development server
npm run dev        # Runs on http://localhost:3001
```

**Get API Keys:**
- GitHub Token: https://github.com/settings/tokens (needs `repo` or `public_repo` scope)
- Gemini API: https://ai.google.dev/
- Clerk Authentication: https://dashboard.clerk.com

---

## Backend API Endpoints

### 1. Start Analysis
```bash
POST /api/analyze-pr
Content-Type: application/json

{
  "repo_url": "https://github.com/owner/repo",
  "pr_number": 123
}

# Response (202 Accepted)
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status_url": "/api/status/{task_id}",
  "results_url": "/api/results/{task_id}"
}
```

### 2. Check Status
```bash
GET /api/status/:task_id

# Response
{
  "status": "processing",  # pending | processing | completed | failed
  "created_at": "2026-01-03T10:30:00.000Z"
}
```

### 3. Get Results
```bash
GET /api/results/:task_id

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

## Frontend Pages

### Authentication Pages
- `/sign-in` - User login with Clerk
- `/sign-up` - New user registration

### Dashboard Pages
- `/dashboard` - Main dashboard with analysis history
- `/dashboard/analyze` - Start new PR analysis
- `/dashboard/analysis/[id]` - View detailed analysis results
- `/dashboard/profile` - User profile and settings

---

## Usage Examples

### Using the Web Interface

1. Go to `http://localhost:3001`
2. Sign in with your Clerk account
3. Navigate to "Analyze" tab
4. Enter GitHub repository URL and PR number
5. Click "Analyze PR"
6. View real-time status and results on the dashboard

### Using Backend API with cURL

```bash
# 1. Start analysis
curl -X POST http://localhost:3000/api/analyze-pr \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react", "pr_number": 28000}'

# 2. Check status (replace {task_id} with response from step 1)
curl http://localhost:3000/api/status/{task_id}

# 3. Get results
curl http://localhost:3000/api/results/{task_id}
```

### Using Live Deployment (Render)

```bash
curl -X POST https://github-pr-analyzer.onrender.com/api/analyze-pr \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react", "pr_number": 28000}'
```

---


### Scalability
4. **Single Server Only** - Can't distribute across multiple instances
5. **No Job Queue** - Tasks lost if server crashes mid-processing
6. **File Limits** - Max 100 files per PR, 50MB response, 30s timeout

---

## 🚀 Future Improvements

### Backend Enhancements
- [ ] Implement BullMQ/Celery job queue for reliability
- [ ] Add comprehensive automated tests (Jest/Mocha)
- [ ] Enhanced AI analysis (security vulnerabilities, complexity metrics)
- [ ] Caching layer for PR data
- [ ] Multi-model support (OpenAI, Claude)
- [ ] Metrics & monitoring (Prometheus)

### Frontend Enhancements

- [ ] Advanced filtering & search for analyses
- [ ] Export analysis reports (PDF, JSON)
- [ ] Collaboration features (share analyses)
- [ ] Email notifications for analysis completion
- [ ] Webhook integrations

### DevOps & Deployment
- [ ] Docker containerization for both services
- [ ] Docker Compose for local development
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated deployment to Render
- [ ] Environment-specific configurations
- [ ] Health checks & monitoring

---

## Troubleshooting

### Backend Issues

#### "GitHub authentication failed"
- Generate token at https://github.com/settings/tokens
- Add to `.env`: `GITHUB_TOKEN=your_token_here`
- Ensure token has `repo` or `public_repo` scope
- Restart server

#### "Invalid API key"
- Get Gemini key from https://ai.google.dev/
- Add to `.env`: `GOOGLE_API_KEY=your_key_here`
- Verify in logs: `Gemini API: ✓ Configured`

#### "Pull request not found"
- Verify PR exists: `https://github.com/owner/repo/pull/NUMBER`
- Check token has `repo` scope for private repos

#### "Task not found"
- Tasks are persisted in MongoDB and survive server restarts. Verify database connectivity and check the tasks/analyses collection for the `task_id`.

#### "GitHub API timeout"
- PRs with 100+ files limited to first 100
- Very large PRs may fail (30s timeout)

### Frontend Issues

#### "Cannot connect to backend"
- Verify backend is running on port 3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure no firewall blocking port 3000

#### "Authentication failed"
- Verify Clerk keys in `.env.local`
- Check Clerk dashboard for correct application
- Clear browser cookies and try again

#### "API requests failing"
- Check browser console for error details
- Verify backend `.env` has correct API keys
- Check CORS configuration if on different domain

#### "Blank page or loading infinitely"
- Check browser developer tools (F12) for errors
- Verify all environment variables are set
- Try clearing cache: `npm run build` then `npm run dev`

### General

#### Port Already in Use
```bash
# Kill process on port 3000 (backend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3001 (frontend)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

#### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

---

## Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  - Authentication (Clerk)                              │
│  - Dashboard & Analysis Pages                          │
│  - Real-time Status Polling                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Backend (Express.js)                  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           API Routes & Middleware               │   │
│  │  - POST /api/analyze-pr (Start analysis)        │   │
│  │  - GET /api/status/:task_id (Check status)      │   │
│  │  - GET /api/results/:task_id (Get results)      │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │     Task Manager (MongoDB-backed, persistent)  │   │
│  │  - Task tracking & status management            │   │
│  │  - Background task execution                    │   │
│  └──────────┬──────────────────────┬───────────────┘   │
│             │                      │                    │
│  ┌──────────▼──────────┐  ┌────────▼────────────────┐  │
│  │  GitHub Service    │  │  LangChain Agent        │  │
│  │  - Fetch PR files  │  │  - Gemini 2.0 Flash     │  │
│  │  - PR metadata     │  │  - Code analysis        │  │
│  │  - Axios HTTP      │  │  - Issue detection      │  │
│  └────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
```
User Input → Frontend (Clerk Auth) → Express Validation
    ↓
Task Manager (Create task_id)
    ↓
Parallel Async Processing:
  ├→ GitHub Service (Fetch PR changes)
  └→ AI Service (Gemini analysis via LangChain)
    ↓
Results persisted in MongoDB (tasks & results collection)
    ↓
Frontend Polls Status → Displays Results
```

---

## Support & Development

### Getting Help
1. Check [Troubleshooting](#troubleshooting) section first
2. Review server/client logs for error messages
3. Verify all `.env` and `.env.local` configurations
4. Ensure API keys have correct permissions

### Development Tips
- Use `npm run dev` for auto-reload during development
- Check backend logs for API errors
- Check frontend console (F12) for client-side errors
- Test API endpoints with provided cURL examples
- Use Clerk dashboard to manage test users

### Local Testing Checklist
- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] GitHub Token has `repo` scope
- [ ] Gemini API key is valid
- [ ] Clerk keys are configured correctly
- [ ] Can sign in to the application
- [ ] Can submit PR analysis request
- [ ] Status updates in real-time

---


---

