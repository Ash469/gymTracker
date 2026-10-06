const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const progressController = require('../controllers/progress.controller');

const router = express.Router();

router.use(authMiddleware);

// GET /api/v1/progress               — overall progress
router.get('/', progressController.getOverallProgress);

// GET /api/v1/progress/:exerciseId   — exercise-specific progress
router.get('/:exerciseId', progressController.getExerciseProgress);

module.exports = router;
