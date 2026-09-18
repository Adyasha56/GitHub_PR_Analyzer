# GitHub PR Analyzer - Full Stack Upgrade Plan

> [!NOTE]
> **Status: historical planning doc.** The Clerk + MongoDB + Next.js migration
> described below is complete. See [Current State vs. This Plan](#-current-state-vs-this-plan)
> at the bottom for what actually shipped and what diverged from the original plan.
> For up-to-date setup/usage, see `README.md`.

## 📋 Project Overview

**Current State:**
- Express.js backend with PR analysis functionality
- In-memory storage (TaskManager using Map)
- Multi-AI provider support (Gemini, OpenAI, Claude, Grok)
- LangChain integration for code analysis
- No authentication, no persistent storage, no UI

**Target State:**
- Full-stack Next.js application with modern UI
- Clerk authentication
- MongoDB Atlas for persistent storage
- Dashboard with PR analysis history

---

## 🎨 Design System

### Color Palette
| Usage | Color | Hex Code |
|-------|-------|----------|
| Primary/Accent | Emerald Green | `#238636` |
| Primary Hover | Light Green | `#2ea043` |
| Background | Black | `#000000` |
| Card Background | Dark Gray | `#0d1117` |
| Border | Gray | `#30363d` |
| Text Primary | White | `#ffffff` |
| Text Secondary | Gray | `#8b949e` |
| Error | Red | `#f85149` |
| Success | Green | `#238636` |

### Typography
- Font Family: Inter (primary), system-ui (fallback)
- Headings: Bold, white
- Body: Regular, gray tones

---

## 🏗️ Architecture

### Project Structure (Monorepo)
```
Github_PR_Analyzer/
├── backend/                    # Express.js API Server
│   ├── src/
│   │   ├── index.js           # Main server (updated)
│   │   ├── config/
│   │   │   └── database.js    # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js        # User model
│   │   │   └── Analysis.js    # PR Analysis model
│   │   ├── middleware/
│   │   │   └── auth.js        # Clerk auth middleware
│   │   ├── routes/
│   │   │   ├── analyze.js     # PR analysis routes (updated)
│   │   │   └── user.js        # User routes
│   │   ├── services/
│   │   │   ├── ai.js
│   │   │   ├── github.js
│   │   │   └── langchain.js
│   │   └── utils/
│   │       └── taskManager.js # Updated to use MongoDB
│   ├── package.json
│   └── .env
│
├── frontend/                   # Next.js 14 App
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Clerk
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Global styles
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx     # Dashboard layout with sidebar
│   │       ├── page.tsx       # Main dashboard
│   │       └── profile/
│   │           └── page.tsx   # User profile
│   ├── components/
│   │   ├── ui/               # shadcn components
│   │   ├── landing/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AnalysisCard.tsx
│   │   │   ├── AnalysisForm.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── PRHistory.tsx
│   │   └── shared/
│   │       └── Logo.tsx
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   └── utils.ts          # Utility functions
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local
│
├── package.json               # Root package.json (workspaces)
├── Note.md                    # This file
└── README.md
```

---

## 🔧 Backend Implementation

### Phase 1: MongoDB Setup

#### 1.1 Install Dependencies
```bash
npm install mongoose @clerk/express
```

#### 1.2 Database Models

**User Model (`models/User.js`)**
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  imageUrl: { type: String },
  analysisCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

**Analysis Model (`models/Analysis.js`)**
```javascript
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  repoUrl: { type: String, required: true },
  repoName: { type: String }, // Extracted from URL
  prNumber: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  results: { type: mongoose.Schema.Types.Mixed },
  error: { type: String },
  aiProvider: { type: String },
  filesAnalyzed: { type: Number, default: 0 },
  issuesFound: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Index for efficient queries
analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
```

#### 1.3 Database Connection (`config/database.js`)
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Phase 2: Clerk Authentication

#### 2.1 Auth Middleware (`middleware/auth.js`)
```javascript
const { clerkClient, requireAuth } = require('@clerk/express');

// Verify Clerk session
const verifyAuth = requireAuth();

// Get user from Clerk
const getUserFromClerk = async (req, res, next) => {
  try {
    if (req.auth?.userId) {
      const user = await clerkClient.users.getUser(req.auth.userId);
      req.user = {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        imageUrl: user.imageUrl
      };
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyAuth, getUserFromClerk };
```

### Phase 3: Updated API Routes

#### 3.1 Environment Variables
```env
# Backend .env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pr-analyzer
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
GITHUB_TOKEN=ghp_xxxxx
GOOGLE_API_KEY=xxxxx
AI_PROVIDER=gemini
```

#### 3.2 Protected Routes
- `POST /api/analyze-pr` - Requires auth, creates analysis
- `GET /api/analyses` - Get user's analysis history
- `GET /api/analyses/:id` - Get specific analysis
- `GET /api/stats` - Get user stats (total analyses, repos tested)
- `GET /api/status/:task_id` - Check analysis status
- `DELETE /api/analyses/:id` - Delete analysis

---

## 💻 Frontend Implementation

### Phase 1: Next.js Setup

#### 1.1 Create Next.js App
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false
cd frontend
npx shadcn@latest init
```

#### 1.2 Install Dependencies
```bash
npm install @clerk/nextjs axios lucide-react
npx shadcn@latest add button card input label badge dialog sheet separator avatar dropdown-menu accordion
```

#### 1.3 Tailwind Configuration
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#238636',
        'primary-hover': '#2ea043',
        background: '#000000',
        'card-bg': '#0d1117',
        border: '#30363d',
        'text-primary': '#ffffff',
        'text-secondary': '#8b949e',
      }
    }
  }
}
```

### Phase 2: Pages & Components

#### 2.1 Landing Page Structure
```
┌─────────────────────────────────────────┐
│              NAVBAR                      │
│  Logo    Features  Pricing  FAQ  [Login] │
├─────────────────────────────────────────┤
│                                         │
│              HERO SECTION               │
│   "AI-Powered PR Code Review"           │
│   [Get Started] [View Demo]             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│              FEATURES                   │
│   🔍 Smart Analysis                     │
│   🤖 Multi-AI Support                   │
│   ⚡ Fast Results                       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│              FAQ SECTION                │
│   Accordion with common questions       │
│                                         │
├─────────────────────────────────────────┤
│              FOOTER                     │
│   Links  |  Social  |  Copyright        │
└─────────────────────────────────────────┘
```

#### 2.2 Dashboard Layout
```
┌──────────┬────────────────────────────────┐
│          │        HEADER                  │
│          │  Dashboard    [User Avatar ▼]  │
│  SIDEBAR ├────────────────────────────────┤
│          │                                │
│  Logo    │   STATS CARDS                  │
│          │   ┌───────┐ ┌───────┐          │
│  📊 Dash │   │ Total │ │ Repos │          │
│          │   │  25   │ │  12   │          │
│  👤 Prof │   └───────┘ └───────┘          │
│          │                                │
│          │   NEW ANALYSIS FORM            │
│          │   ┌───────────────────────┐    │
│          │   │ Repo URL: [........] │    │
│          │   │ PR #:     [.......] │    │
│          │   │ [Analyze PR]         │    │
│          │   └───────────────────────┘    │
│          │                                │
│          │   RECENT ANALYSES              │
│  ────────│   ┌───────────────────────┐    │
│  [Logout]│   │ Card: owner/repo #42 │    │
│          │   │ Status: ✅ 5 issues   │    │
│          │   └───────────────────────┘    │
│          │   ┌───────────────────────┐    │
│          │   │ Card: user/lib #13   │    │
│          │   └───────────────────────┘    │
└──────────┴────────────────────────────────┘
```

### Phase 3: Key Components

#### 3.1 Analysis Card Component
```typescript
interface AnalysisCardProps {
  id: string;
  repoName: string;
  prNumber: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  issuesFound: number;
  createdAt: string;
  onClick: () => void;
}
```

#### 3.2 Analysis Form Component
```typescript
interface AnalysisFormProps {
  onSubmit: (repoUrl: string, prNumber: number) => void;
  isLoading: boolean;
}
```

---

## 📋 Implementation Checklist

### Backend Tasks
- [ ] 1. Restructure backend folder
- [ ] 2. Add MongoDB connection
- [ ] 3. Create User model
- [ ] 4. Create Analysis model
- [ ] 5. Add Clerk middleware
- [ ] 6. Update analyze routes with auth
- [ ] 7. Add user routes
- [ ] 8. Update TaskManager for MongoDB
- [ ] 9. Add stats endpoint
- [ ] 10. Test all endpoints

### Frontend Tasks
- [ ] 1. Initialize Next.js project
- [ ] 2. Configure Tailwind with custom colors
- [ ] 3. Setup shadcn/ui
- [ ] 4. Configure Clerk provider
- [ ] 5. Create Landing Page
   - [ ] Navbar
   - [ ] Hero Section
   - [ ] Features Section
   - [ ] FAQ Section
   - [ ] Footer
- [ ] 6. Create Auth Pages
   - [ ] Sign In
   - [ ] Sign Up
- [ ] 7. Create Dashboard
   - [ ] Sidebar
   - [ ] Stats Cards
   - [ ] Analysis Form
   - [ ] Analysis History
   - [ ] Analysis Detail Modal
- [ ] 8. Create Profile Page
- [ ] 9. API Integration
- [ ] 10. Error Handling & Loading States

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pr-analyzer

# Clerk
CLERK_SECRET_KEY=sk_test_xxxxx

# GitHub
GITHUB_TOKEN=ghp_xxxxx

# AI Providers
AI_PROVIDER=gemini
GOOGLE_API_KEY=xxxxx
OPENAI_API_KEY=xxxxx
ANTHROPIC_API_KEY=xxxxx
```

### Frontend (`frontend/.env.local`)
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 Development Order

### Step 1: Backend Updates (Start Here)
1. Create `backend/` folder and move existing src files
2. Install MongoDB & Clerk packages
3. Add database config and models
4. Add auth middleware
5. Update routes with authentication
6. Test with Postman/Thunder Client

### Step 2: Frontend Setup
1. Create Next.js app in `frontend/` folder
2. Configure Tailwind with theme colors
3. Setup Clerk provider
4. Install and configure shadcn/ui

### Step 3: Landing Page
1. Create Navbar component
2. Create Hero section
3. Create Features section
4. Create FAQ section
5. Create Footer

### Step 4: Authentication
1. Create sign-in page
2. Create sign-up page
3. Test auth flow

### Step 5: Dashboard
1. Create dashboard layout with sidebar
2. Create stats cards
3. Create analysis form
4. Create analysis cards
5. Connect to backend API
6. Add real-time status updates

### Step 6: Profile & Polish
1. Create profile page
2. Add logout functionality
3. Error handling
4. Loading states
5. Responsive design

---

## 📦 API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/analyze-pr` | ✅ | Start new PR analysis |
| GET | `/api/status/:taskId` | ✅ | Get analysis status |
| GET | `/api/analyses` | ✅ | Get user's analyses |
| GET | `/api/analyses/:id` | ✅ | Get single analysis |
| DELETE | `/api/analyses/:id` | ✅ | Delete analysis |
| GET | `/api/stats` | ✅ | Get user statistics |
| POST | `/api/webhook/clerk` | - | Clerk webhook for user sync |

---

## 🎯 MVP Features

1. **Authentication** ✓
   - Sign up / Sign in with Clerk
   - Session management
   - Protected routes

2. **PR Analysis** ✓
   - Submit repo URL + PR number
   - Real-time status updates
   - View detailed results

3. **History** ✓
   - View past analyses
   - Filter by status
   - Delete analyses

4. **Stats** ✓
   - Total analyses count
   - Unique repos tested

---

## 🔄 Next Steps

**Ready to start? Let's begin with the backend restructuring and MongoDB integration!**

Run these commands to start:
```bash
# Create backend folder structure
mkdir backend
# Move existing files
# Install new dependencies
cd backend
npm install mongoose @clerk/express
```

---

## 📌 Current State vs. This Plan

This plan's core architecture (Next.js + Clerk + MongoDB) was implemented as
described. A few things evolved past what's written above:

- **`utils/taskManager.js`** - the in-memory version mentioned in the original
  structure was superseded by direct MongoDB reads/writes on the `Analysis`
  model and has since been deleted entirely (it was never migrated, just left
  behind as dead code until removed).
- **AI analysis path** - `services/langchain.js` (LangChain agent via
  `@langchain/google-genai`) is now the primary analysis path, with
  `services/ai.js` (direct Gemini REST calls) kept as an automatic fallback if
  the agent call throws. Both were previously duplicated with only `ai.js`
  actually wired up; that's fixed.
- **GitHub access** - added `services/githubAuth.js`, which resolves a
  per-user GitHub OAuth token via Clerk's connected-accounts feature
  (`clerkClient.users.getUserOauthAccessToken`), falling back to the shared
  `GITHUB_TOKEN` for users who haven't connected their GitHub account. This
  wasn't in the original plan - the original plan only ever used the single
  shared PAT.
- **Multi-model support** (OpenAI/Claude/Grok) - `AI_PROVIDER` env var and
  SDKs are still installed but not actually implemented; only Gemini works
  regardless of the setting. Not yet done, contrary to what package.json
  dependencies might suggest.

*Document created: Planning phase for GitHub PR Analyzer Full-Stack Application*
