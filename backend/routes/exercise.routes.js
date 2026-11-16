const express = require('express');
const exerciseController = require('../controllers/exercise.controller');

const router = express.Router();

// GET /api/v1/exercises        — list all active exercises
router.get('/', exerciseController.listExercises);

// GET /api/v1/exercises/:exerciseId — get exercise details
router.get('/:exerciseId', exerciseController.getExercise);

module.exports = router;
