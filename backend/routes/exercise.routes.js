const express = require('express');
const exerciseController = require('../controllers/exercise.controller');

const router = express.Router();


router.get('/', exerciseController.listExercises);

router.get('/:exerciseId', exerciseController.getExercise);

module.exports = router;
