const coachingService = require('../services/coaching.service');

/**
 * POST /api/v1/coaching/analyze — Request AI coaching for a workout
 */
async function analyzeWorkout(req, res) {
  try {
    const { workoutId } = req.body;

    if (!workoutId) {
      return res.status(400).json({ error: 'workoutId is required.' });
    }

    const coaching = await coachingService.analyzeWorkout(req.user.id, workoutId);
    return res.status(201).json({ coaching });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /api/v1/coaching — List coaching history
 */
async function getCoachingHistory(req, res) {
  try {
    const coaching = await coachingService.getCoachingHistory(req.user.id);
    return res.json({ coaching });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /api/v1/coaching/:coachingId — Get a specific coaching session
 */
async function getCoachingById(req, res) {
  try {
    const coaching = await coachingService.getCoachingById(
      req.user.id,
      req.params.coachingId
    );
    return res.json({ coaching });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * POST /api/v1/coaching/plan — Generate personalized AI Workout Plan (Mode A)
 */
async function generateWorkoutPlan(req, res) {
  try {
    const { planType } = req.body;
    const plan = await coachingService.generateWorkoutPlan(req.user.id, planType || 'DAILY');
    return res.status(201).json({ plan });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /api/v1/coaching/plan — Fetch latest AI Workout Plan
 */
async function getLatestWorkoutPlan(req, res) {
  try {
    const plan = await coachingService.getLatestWorkoutPlan(req.user.id);
    return res.json({ plan });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * POST /api/v1/coaching/chat — Ask AWS Bedrock AI Coach a custom question
 */
async function askCoachQuestion(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Question prompt is required.' });
    }

    const coaching = await coachingService.askCoachQuestion(req.user.id, prompt.trim());
    return res.status(201).json({ coaching });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * DELETE /api/v1/coaching/:coachingId — Delete a coaching entry or chat session
 */
async function deleteCoachingSession(req, res) {
  try {
    const result = await coachingService.deleteCoachingSession(req.user.id, req.params.coachingId);
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = {
  analyzeWorkout,
  getCoachingHistory,
  getCoachingById,
  generateWorkoutPlan,
  getLatestWorkoutPlan,
  askCoachQuestion,
  deleteCoachingSession,
};
