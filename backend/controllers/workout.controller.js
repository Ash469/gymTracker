const workoutService = require('../services/workout.service');

/**
 * POST /api/v1/workouts — Start a new workout
 */
async function createWorkout(req, res) {
  try {
    const workout = await workoutService.createWorkout(req.user.id);
    return res.status(201).json({ workout });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /api/v1/workouts — List all workouts
 */
async function listWorkouts(req, res) {
  try {
    const workouts = await workoutService.listWorkouts(req.user.id);
    return res.json({ workouts });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /api/v1/workouts/:workoutId — Get a single workout
 */
async function getWorkout(req, res) {
  try {
    const workout = await workoutService.getWorkout(req.user.id, req.params.workoutId);
    return res.json({ workout });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * PATCH /api/v1/workouts/:workoutId/complete — Complete a workout
 */
async function completeWorkout(req, res) {
  try {
    const workout = await workoutService.completeWorkout(req.user.id, req.params.workoutId, req.body);
    return res.json({ workout });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * PATCH /api/v1/workouts/:workoutId/abandon — Abandon a workout
 */
async function abandonWorkout(req, res) {
  try {
    const workout = await workoutService.abandonWorkout(req.user.id, req.params.workoutId);
    return res.json({ workout });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * POST /api/v1/workouts/:workoutId/sets — Add a set to a workout
 */
async function addSet(req, res) {
  try {
    const { exerciseId, reps, averageScore, bestScore, worstScore, duration, errors } = req.body;

    if (!exerciseId) {
      return res.status(400).json({ error: 'exerciseId is required.' });
    }

    const set = await workoutService.addSet(req.user.id, req.params.workoutId, {
      exerciseId,
      reps,
      averageScore,
      bestScore,
      worstScore,
      duration,
      errors,
    });
    return res.status(201).json({ set });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /api/v1/sets/:setId — Get a single set
 */
async function getSet(req, res) {
  try {
    const set = await workoutService.getSet(req.user.id, req.params.setId);
    return res.json({ set });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = {
  createWorkout,
  listWorkouts,
  getWorkout,
  completeWorkout,
  abandonWorkout,
  addSet,
  getSet,
};
