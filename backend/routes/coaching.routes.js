const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const coachingController = require('../controllers/coaching.controller');

const router = express.Router();

// All coaching routes require authentication
router.use(authMiddleware);

// POST /api/v1/coaching/analyze        — request AI coaching for a workout
router.post('/analyze', coachingController.analyzeWorkout);

// GET  /api/v1/coaching/plan           — fetch active AI workout plan
router.get('/plan', coachingController.getLatestWorkoutPlan);

// POST /api/v1/coaching/plan           — generate AI daily/weekly workout plan (Mode A)
router.post('/plan', coachingController.generateWorkoutPlan);

// POST /api/v1/coaching/chat           — ask Bedrock AI Coach custom question
router.post('/chat', coachingController.askCoachQuestion);

// GET  /api/v1/coaching                — list coaching history
router.get('/', coachingController.getCoachingHistory);

// GET  /api/v1/coaching/:coachingId    — get a specific coaching session
router.get('/:coachingId', coachingController.getCoachingById);

// DELETE /api/v1/coaching/:coachingId — delete a coaching session or chat entry
router.delete('/:coachingId', coachingController.deleteCoachingSession);

module.exports = router;
