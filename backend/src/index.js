require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { authMiddleware } = require('./middleware/auth');
const analyzeRoutes = require('./routes/analyze');

// Validate environment variables based on AI provider
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

if (AI_PROVIDER === 'openai' && !process.env.OPENAI_API_KEY) {
  console.error(' ERROR: OPENAI_API_KEY is not set in .env file');
  console.error('Get your API key from: https://platform.openai.com/api-keys');
  process.exit(1);
} else if (AI_PROVIDER === 'gemini' && !process.env.GOOGLE_API_KEY) {
  console.error(' ERROR: GOOGLE_API_KEY is not set in .env file');
  console.error('Get your API key from: https://makersuite.google.com/app/apikey');
  process.exit(1);
} else if (AI_PROVIDER === 'grok' && !process.env.XAI_API_KEY && !process.env.GROK_API_KEY) {
  console.error('ERROR: XAI_API_KEY or GROK_API_KEY is not set in .env file');
  console.error('Get your API key from: https://console.x.ai/');
  process.exit(1);
} else if (AI_PROVIDER === 'claude' && !process.env.ANTHROPIC_API_KEY) {
  console.error(' ERROR: ANTHROPIC_API_KEY is not set in .env file');
  console.error('Get your API key from: https://console.anthropic.com/');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS configuration for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk authentication middleware
app.use(authMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AI Code Review Agent',
    status: 'running',
    version: '2.0.0',
    ai_provider: AI_PROVIDER,
    endpoints: {
      analyze: 'POST /api/analyze-pr',
      analyses: 'GET /api/analyses',
      status: 'GET /api/status/:task_id',
      stats: 'GET /api/stats',
      health: 'GET /health'
    },
    documentation: 'See README.md for usage examples'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    ai_provider: AI_PROVIDER
  });
});

// analysis routes (with /api prefix)
app.use('/api', analyzeRoutes);

// Legacy routes (without /api prefix) - for backward compatibility
app.use('/', analyzeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    available_endpoints: [
      'POST /api/analyze-pr',
      'GET /api/analyses',
      'GET /api/status/:task_id',
      'GET /api/stats'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(' AI Code Review Agent Server Started');
  console.log('='.repeat(60));
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` AI Provider: ${AI_PROVIDER.toUpperCase()}`);
  
  // Show API key status based on provider
  if (AI_PROVIDER === 'grok') {
    console.log(` Grok API: ${(process.env.XAI_API_KEY || process.env.GROK_API_KEY) ? '✓ Configured' : '✗ Missing'}`);
  } else if (AI_PROVIDER === 'gemini') {
    console.log(` Gemini API: ${process.env.GOOGLE_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  } else if (AI_PROVIDER === 'openai') {
    console.log(` OpenAI API: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  } else if (AI_PROVIDER === 'claude') {
    console.log(` Claude API: ${process.env.ANTHROPIC_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  }
  
  console.log(` GitHub Token: ${process.env.GITHUB_TOKEN ? '✓ Configured' : '✗ Not set (optional)'}`);
  console.log(` MongoDB: ${process.env.MONGODB_URI ? '✓ Configured' : '✗ Not set'}`);
  console.log(` Clerk Auth: ${process.env.CLERK_SECRET_KEY ? '✓ Configured' : '✗ Not set'}`);
  console.log('='.repeat(60));
  console.log('\n Available Endpoints:');
  console.log(`   POST   http://localhost:${PORT}/api/analyze-pr`);
  console.log(`   GET    http://localhost:${PORT}/api/analyses`);
  console.log(`   GET    http://localhost:${PORT}/api/status/:task_id`);
  console.log(`   GET    http://localhost:${PORT}/api/stats`);
  console.log('\n Test with: curl or Postman or the examples in test-requests.http');
  console.log('='.repeat(60));
});

module.exports = app;