const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const coachingController = require('../controllers/coaching.controller');

const router = express.Router();

// All coaching routes require authentication
router.use(authMiddleware);

// POST /api/v1/coaching/analyze        — request AI coaching for a workout
router.post('/analyze', coachingController.analyzeWorkout);

// GET  /api/v1/coaching                — list coaching history
router.get('/', coachingController.getCoachingHistory);

// GET  /api/v1/coaching/:coachingId    — get a specific coaching session
router.get('/:coachingId', coachingController.getCoachingById);

module.exports = router;
