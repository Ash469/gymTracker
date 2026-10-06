require('dotenv').config();

const express = require('express');
const cors = require('cors');

// ── Route Modules ───────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const workoutRoutes = require('./routes/workout.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const progressRoutes = require('./routes/progress.routes');
const coachingRoutes = require('./routes/coaching.routes');

// ── App Initialisation ──────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// ── Global Middleware ───────────────────────────────────
app.use(cors());
app.use(express.json());

const { query } = require('./db');
const bedrockService = require('./services/bedrock.service');

// ── Diagnostic Health Check Endpoint ───────────────────
app.get('/', async (_req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    const dbTest = await query('SELECT NOW()');
    if (dbTest.rows.length > 0) dbStatus = 'connected';
  } catch (err) {
    dbError = err.message;
  }

  res.json({
    status: 'online',
    app: 'FormFit API',
    database: dbStatus,
    dbError: dbError,
    // bedrock: bedrockService.getBedrockStatus(),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});



// ── API Routes (v1) ────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/coaching', coachingRoutes);


const authMiddleware = require('./middleware/auth.middleware');
const workoutController = require('./controllers/workout.controller');
app.get('/api/v1/sets/:setId', authMiddleware, workoutController.getSet);

// ── 404 Handler ────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global Error Handler ───────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error.',
  });
});

// ── Start Server ───────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n   FormFit API running at http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

module.exports = app;
