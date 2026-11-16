const exerciseService = require('../services/exercise.service');

/**
 * GET /api/v1/exercises — List all active exercises
 */
async function listExercises(_req, res) {
  try {
    const exercises = await exerciseService.listExercises();
    return res.json({ exercises });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /api/v1/exercises/:exerciseId — Get exercise details
 */
async function getExercise(req, res) {
  try {
    const exercise = await exerciseService.getExercise(req.params.exerciseId);
    return res.json({ exercise });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = { listExercises, getExercise };
