require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const analyzeRoutes = require('./routes/analyze');

// Validate environment variables based on AI provider
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

// Check AI provider API keys
if (AI_PROVIDER === 'openai' && !process.env.OPENAI_API_KEY) {
  console.error(' ERROR: OPENAI_API_KEY is not set in .env file');
  console.error('Get your API key from: https://platform.openai.com/api-keys');
  process.exit(1);
} else if (AI_PROVIDER === 'gemini' && !process.env.GOOGLE_API_KEY) {
  console.error(' ERROR: GOOGLE_API_KEY is not set in .env file');
  console.error('Get your API key from: https://makersuite.google.com/app/apikey');
  process.exit(1);
} else if (AI_PROVIDER === 'grok' && !process.env.XAI_API_KEY && !process.env.GROK_API_KEY) {
  console.error(' ERROR: XAI_API_KEY or GROK_API_KEY is not set in .env file');
  console.error('Get your API key from: https://console.x.ai/');
  process.exit(1);
} else if (AI_PROVIDER === 'claude' && !process.env.ANTHROPIC_API_KEY) {
  console.error(' ERROR: ANTHROPIC_API_KEY is not set in .env file');
  console.error('Get your API key from: https://console.anthropic.com/');
  process.exit(1);
}

// Check Clerk authentication
if (!process.env.CLERK_SECRET_KEY) {
  console.warn('WARNING: CLERK_SECRET_KEY is not set - Authentication will not work!');
  console.warn('Get your keys from: https://dashboard.clerk.com/');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS configuration - Allow frontend to access API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Root endpoint - Service info
app.get('/', (req, res) => {
  res.json({
    service: 'GitHub PR Analyzer API',
    status: 'running',
    version: '2.0.0',
    ai_provider: AI_PROVIDER,
    authentication: 'Clerk',
    endpoints: {
      analyze: 'POST /api/analyze-pr',
      status: 'GET /api/status/:task_id',
      analyses: 'GET /api/analyses',
      analysis: 'GET /api/analysis/:id',
      stats: 'GET /api/stats',
      delete: 'DELETE /api/analysis/:id',
      health: 'GET /health'
    },
    documentation: 'All endpoints require Clerk authentication token'
  });
});

// Health check endpoint - No auth required
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    ai_provider: AI_PROVIDER,
    database: 'connected',
    auth: process.env.CLERK_SECRET_KEY ? 'configured' : 'not configured'
  });
});

// Mount API routes (all protected by auth middleware in routes file)
app.use('/api', analyzeRoutes);

// Legacy routes (without /api prefix) - for backward compatibility
app.use('/', analyzeRoutes);

// 404 handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    available_endpoints: [
      'POST /api/analyze-pr',
      'GET /api/analyses',
      'GET /api/analysis/:id',
      'GET /api/status/:task_id',
      'GET /api/stats',
      'DELETE /api/analysis/:id',
      'GET /health'
    ],
    note: 'All endpoints (except /health) require Clerk authentication'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  
  // Handle Clerk authentication errors
  if (err.name === 'ClerkAPIError' || err.message.includes('clerk')) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or missing authentication token',
      hint: 'Make sure you are logged in and your token is valid'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('GitHub PR Analyzer API Server Started');
  console.log('='.repeat(70));
  console.log(`Server URL:        http://localhost:${PORT}`);
  console.log(`AI Provider:       ${AI_PROVIDER.toUpperCase()}`);
  console.log(` Environment:       ${process.env.NODE_ENV || 'development'}`);
  console.log('─'.repeat(70));
  
  // Show configuration status
  console.log('Configuration Status:');
  
  // AI Provider status
  if (AI_PROVIDER === 'grok') {
    console.log(`   Grok API:          ${(process.env.XAI_API_KEY || process.env.GROK_API_KEY) ? 'Configured' : 'Missing'}`);
  } else if (AI_PROVIDER === 'gemini') {
    console.log(`   Gemini API:        ${process.env.GOOGLE_API_KEY ? 'Configured' : 'Missing'}`);
  } else if (AI_PROVIDER === 'openai') {
    console.log(`   OpenAI API:        ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
  } else if (AI_PROVIDER === 'claude') {
    console.log(`   Claude API:        ${process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Missing'}`);
  }
  
  console.log(`   GitHub Token:      ${process.env.GITHUB_TOKEN ? 'Configured' : 'Optional'}`);
  console.log(`   MongoDB:           ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`   Clerk Auth:        ${process.env.CLERK_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`   Frontend URL:      ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  console.log('─'.repeat(70));
  console.log('Available Endpoints:');
  console.log(`   POST   http://localhost:${PORT}/api/analyze-pr`);
  console.log(`   GET    http://localhost:${PORT}/api/analyses`);
  console.log(`   GET    http://localhost:${PORT}/api/analysis/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/status/:task_id`);
  console.log(`   GET    http://localhost:${PORT}/api/stats`);
  console.log(`   DELETE http://localhost:${PORT}/api/analysis/:id`);
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log('─'.repeat(70));
  console.log(' Note: All endpoints require Clerk authentication (except /health)');
  console.log('Test with: curl, Postman, or test-request.http');
  console.log('='.repeat(70));
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;