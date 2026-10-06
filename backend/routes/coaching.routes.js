const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const coachingController = require('../controllers/coaching.controller');

const router = express.Router();

router.use(authMiddleware);


router.post('/analyze', coachingController.analyzeWorkout);
router.get('/plan', coachingController.getLatestWorkoutPlan);
router.post('/plan', coachingController.generateWorkoutPlan);
router.post('/chat', coachingController.askCoachQuestion);
router.get('/', coachingController.getCoachingHistory);
router.get('/:coachingId', coachingController.getCoachingById);
router.delete('/:coachingId', coachingController.deleteCoachingSession);

module.exports = router;
