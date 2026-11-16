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

// ── Health Check ────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    app: 'FormFit API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST   /api/v1/auth/register',
        login: 'POST   /api/v1/auth/login',
        logout: 'POST   /api/v1/auth/logout',
        me: 'GET    /api/v1/auth/me',
      },
      exercises: {
        list: 'GET    /api/v1/exercises',
        get: 'GET    /api/v1/exercises/:exerciseId',
      },
      workouts: {
        create: 'POST   /api/v1/workouts',
        list: 'GET    /api/v1/workouts',
        get: 'GET    /api/v1/workouts/:workoutId',
        complete: 'PATCH  /api/v1/workouts/:workoutId/complete',
        abandon: 'PATCH  /api/v1/workouts/:workoutId/abandon',
        addSet: 'POST   /api/v1/workouts/:workoutId/sets',
      },
      sets: {
        get: 'GET    /api/v1/sets/:setId',
      },
      progress: {
        overall: 'GET    /api/v1/progress',
        exercise: 'GET    /api/v1/progress/:exerciseId',
      },
      coaching: {
        analyze: 'POST   /api/v1/coaching/analyze',
        history: 'GET    /api/v1/coaching',
        get: 'GET    /api/v1/coaching/:coachingId',
      },
    },
  });
});

// ── API Routes (v1) ────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/coaching', coachingRoutes);

// ── Standalone Set Route (TRD §24) ─────────────────────
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
app.listen(PORT, () => {
  console.log(`\n  ✦ FormFit API running at http://localhost:${PORT}`);
  console.log(`  ✦ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
