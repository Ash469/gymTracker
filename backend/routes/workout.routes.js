const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const workoutController = require('../controllers/workout.controller');

const router = express.Router();

// All workout routes require authentication
router.use(authMiddleware);

// ── Workout lifecycle (TRD §23) ────────────────────────

// POST   /api/v1/workouts                      — start a new workout
router.post('/', workoutController.createWorkout);

// GET    /api/v1/workouts                      — list all workouts (history)
router.get('/', workoutController.listWorkouts);

// GET    /api/v1/workouts/:workoutId           — get a single workout
router.get('/:workoutId', workoutController.getWorkout);

// PATCH  /api/v1/workouts/:workoutId/complete  — complete a workout
router.patch('/:workoutId/complete', workoutController.completeWorkout);

// PATCH  /api/v1/workouts/:workoutId/abandon   — abandon a workout
router.patch('/:workoutId/abandon', workoutController.abandonWorkout);

// ── Set management (TRD §24) ───────────────────────────

// POST   /api/v1/workouts/:workoutId/sets      — add a set to a workout
router.post('/:workoutId/sets', workoutController.addSet);

module.exports = router;
