require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const connectDB = require('./config/database');
const analyzeRoutes = require('./routes/analyze');

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

// Validate required environment variables
if (AI_PROVIDER === 'openai' && !process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is not set');
  process.exit(1);
} else if (AI_PROVIDER === 'gemini' && !process.env.GOOGLE_API_KEY) {
  console.error('ERROR: GOOGLE_API_KEY is not set');
  process.exit(1);
} else if (AI_PROVIDER === 'grok' && !process.env.XAI_API_KEY && !process.env.GROK_API_KEY) {
  console.error('ERROR: XAI_API_KEY or GROK_API_KEY is not set');
  process.exit(1);
} else if (AI_PROVIDER === 'claude' && !process.env.ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY is not set');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors({
  origin: [process.env.FRONTEND_URL , 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'GitHub PR Analyzer API',
    status: 'running',
    version: '2.0.0',
    ai_provider: AI_PROVIDER
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', analyzeRoutes);
// app.use('/', analyzeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  if (err.name === 'ClerkAPIError' || err.message?.includes('clerk')) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} | AI: ${AI_PROVIDER}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

module.exports = app;
