const progressService = require('../services/progress.service');

/**
 * GET /api/v1/progress — Overall progress for the authenticated user
 */
async function getOverallProgress(req, res) {
  try {
    const progress = await progressService.getOverallProgress(req.user.id);
    return res.json({ progress });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /api/v1/progress/:exerciseId — Progress for a specific exercise
 */
async function getExerciseProgress(req, res) {
  try {
    const progress = await progressService.getExerciseProgress(
      req.user.id,
      req.params.exerciseId
    );
    return res.json({ progress });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = { getOverallProgress, getExerciseProgress };
