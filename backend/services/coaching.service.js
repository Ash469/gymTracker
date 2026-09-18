const { query } = require('../db');
const bedrockService = require('./bedrock.service');

function parseCoachingRow(row) {
  if (!row) return null;
  return {
    ...row,
    strengths: typeof row.strengths === 'string' ? JSON.parse(row.strengths) : (row.strengths || []),
    areasToImprove: typeof row.areasToImprove === 'string' ? JSON.parse(row.areasToImprove) : (row.areasToImprove || []),
    recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : (row.recommendations || []),
    workout: row.workoutOverallScore !== undefined ? {
      id: row.workoutId,
      overallScore: row.workoutOverallScore != null ? parseFloat(row.workoutOverallScore) : null,
      completedAt: row.workoutCompletedAt,
    } : undefined,
  };
}

/**
 * Request AI coaching analysis for a completed workout.
 */
async function analyzeWorkout(userId, workoutId) {
  // 1. Fetch target workout
  const workoutRes = await query(
    'SELECT * FROM workouts WHERE id = $1 AND "userId" = $2',
    [workoutId, userId]
  );

  if (workoutRes.rows.length === 0) {
    const err = new Error('Workout not found.');
    err.statusCode = 404;
    throw err;
  }

  const workoutRow = workoutRes.rows[0];

  const setsRes = await query(
    `SELECT ws.*, e.name as "exerciseName", e."muscleGroup" as "exerciseMuscleGroup"
     FROM workout_sets ws
     JOIN exercises e ON ws."exerciseId" = e.id
     WHERE ws."workoutId" = $1
     ORDER BY ws."setNumber" ASC`,
    [workoutId]
  );

  const setIds = setsRes.rows.map((s) => s.id);
  let feedbackMap = {};
  if (setIds.length > 0) {
    const feedbackRes = await query(
      'SELECT * FROM form_feedback WHERE "setId" = ANY($1::uuid[])',
      [setIds]
    );
    for (const fb of feedbackRes.rows) {
      if (!feedbackMap[fb.setId]) feedbackMap[fb.setId] = [];
      feedbackMap[fb.setId].push(fb);
    }
  }

  const workoutSets = setsRes.rows.map((s) => ({
    exercise: { name: s.exerciseName, muscleGroup: s.exerciseMuscleGroup },
    reps: s.reps,
    weight: s.weight != null ? parseFloat(s.weight) : 0,
    caloriesBurned: s.caloriesBurned != null ? parseInt(s.caloriesBurned) : 0,
    volume: (s.reps || 0) * (s.weight != null ? parseFloat(s.weight) : 0),
    averageScore: s.averageScore != null ? parseFloat(s.averageScore) : null,
    formFeedback: (feedbackMap[s.id] || []).map((fb) => ({
      errorType: fb.errorType,
      occurrenceCount: fb.occurrenceCount,
    })),
  }));

  // 2. Fetch historical context
  const previousWorkoutsRes = await query(
    `SELECT id, "overallScore", "completedAt"
     FROM workouts
     WHERE "userId" = $1 AND status = 'COMPLETED' AND id != $2
     ORDER BY "completedAt" DESC
     LIMIT 5`,
    [userId, workoutId]
  );

  const previousScores = previousWorkoutsRes.rows
    .map((w) => (w.overallScore != null ? parseFloat(w.overallScore) : null))
    .filter(Boolean);

  const previousAverage =
    previousScores.length > 0
      ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length
      : null;

  // 4. Build AI input
  const aiInput = {
    currentWorkout: {
      overallScore: workoutRow.overallScore != null ? parseFloat(workoutRow.overallScore) : null,
      totalCalories: workoutRow.totalCalories || 0,
      exercises: workoutSets.map((s) => ({
        name: s.exercise.name,
        muscleGroup: s.exercise.muscleGroup,
        reps: s.reps,
        weightKg: s.weight,
        volumeKg: s.volume,
        caloriesBurned: s.caloriesBurned,
        score: s.averageScore,
        errors: s.formFeedback.reduce((acc, fb) => {
          acc[fb.errorType] = (acc[fb.errorType] || 0) + fb.occurrenceCount;
          return acc;
        }, {}),
      })),
    },
    historicalContext: {
      previousAverage,
      trend:
        previousAverage === null
          ? 'first_workout'
          : (workoutRow.overallScore || 0) >= previousAverage
            ? 'improving'
            : 'declining',
      totalPreviousWorkouts: previousWorkoutsRes.rows.length,
    },
  };

  // 5. Call Bedrock
  const aiResponse = await bedrockService.getWorkoutRecommendations(aiInput);

  // 6. Persist coaching result
  const coachingRes = await query(
    `INSERT INTO ai_coaching ("userId", "workoutId", summary, strengths, "areasToImprove", recommendations)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      workoutId,
      aiResponse.summary || 'AI coaching analysis completed.',
      JSON.stringify(aiResponse.strengths || []),
      JSON.stringify(aiResponse.areasToImprove || []),
      JSON.stringify(aiResponse.recommendations || []),
    ]
  );

  return parseCoachingRow(coachingRes.rows[0]);
}

/**
 * Get all coaching sessions for a user.
 */
async function getCoachingHistory(userId) {
  const res = await query(
    `SELECT c.*, w."overallScore" as "workoutOverallScore", w."completedAt" as "workoutCompletedAt"
     FROM ai_coaching c
     JOIN workouts w ON c."workoutId" = w.id
     WHERE c."userId" = $1
     ORDER BY c."createdAt" DESC`,
    [userId]
  );
  return res.rows.map(parseCoachingRow);
}

/**
 * Get a specific coaching session.
 */
async function getCoachingById(userId, coachingId) {
  const res = await query(
    `SELECT c.*, w."overallScore" as "workoutOverallScore", w."completedAt" as "workoutCompletedAt"
     FROM ai_coaching c
     JOIN workouts w ON c."workoutId" = w.id
     WHERE c.id = $1 AND c."userId" = $2`,
    [coachingId, userId]
  );

  if (res.rows.length === 0) {
    const err = new Error('Coaching session not found.');
    err.statusCode = 404;
    throw err;
  }

  return parseCoachingRow(res.rows[0]);
}

/**
 * Mode A: Generate and persist a personalized AI Workout Plan for a user.
 */
async function generateWorkoutPlan(userId, planType = 'DAILY') {
  // Fetch user profile
  const userRes = await query(
    'SELECT name, "fitnessLevel", "primaryGoal" FROM users WHERE id = $1',
    [userId]
  );
  const userProfile = userRes.rows[0] || {};

  // Fetch recent workouts history for context
  const recentWorkouts = await query(
    `SELECT w.id, w."overallScore", w."completedAt", ws.reps, ws."averageScore", e.name as "exerciseName"
     FROM workouts w
     JOIN workout_sets ws ON w.id = ws."workoutId"
     JOIN exercises e ON ws."exerciseId" = e.id
     WHERE w."userId" = $1 AND w.status = 'COMPLETED'
     ORDER BY w."completedAt" DESC
     LIMIT 10`,
    [userId]
  );

  const userContext = {
    profile: userProfile,
    recentWorkouts: recentWorkouts.rows,
    requestedPlanType: planType,
  };

  // Call AWS Bedrock for plan generation
  const planData = await bedrockService.generateWorkoutPlan(userContext);

  // Save generated plan to PostgreSQL
  const planRes = await query(
    `INSERT INTO ai_workout_plans ("userId", "planType", title, "aiReasoning", exercises)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      userId,
      planType,
      planData.title || 'Personalized AI Workout Plan',
      planData.aiReasoning || 'Generated based on recent biomechanical performance.',
      JSON.stringify(planData.exercises || []),
    ]
  );

  // Parse exercises JSON before returning
  const row = planRes.rows[0];
  return {
    ...row,
    exercises: typeof row.exercises === 'string' ? JSON.parse(row.exercises) : (row.exercises || []),
  };
}

/**
 * Fetch the latest active AI Workout Plan for a user from PostgreSQL.
 */
async function getLatestWorkoutPlan(userId) {
  const res = await query(
    `SELECT * FROM ai_workout_plans
     WHERE "userId" = $1
     ORDER BY "createdAt" DESC
     LIMIT 1`,
    [userId]
  );
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    ...row,
    exercises: typeof row.exercises === 'string' ? JSON.parse(row.exercises) : (row.exercises || []),
  };
}
async function askCoachQuestion(userId, userPrompt) {
  // Fetch user profile
  const userRes = await query(
    'SELECT name, "fitnessLevel", "primaryGoal" FROM users WHERE id = $1',
    [userId]
  );
  const userProfile = userRes.rows[0] || {};

  // Fetch recent workouts summary & error telemetry (limited to 3 for token efficiency)
  const recentWorkouts = await query(
    `SELECT w.id, w."overallScore", w."completedAt", ws.reps, ws."averageScore", e.name as "exerciseName"
     FROM workouts w
     JOIN workout_sets ws ON w.id = ws."workoutId"
     JOIN exercises e ON ws."exerciseId" = e.id
     WHERE w."userId" = $1 AND w.status = 'COMPLETED'
     ORDER BY w."completedAt" DESC
     LIMIT 6`,
    [userId]
  );

  const userContext = {
    profile: userProfile,
    recentWorkouts: recentWorkouts.rows,
  };

  // Call AWS Bedrock for Q&A response
  const aiAnswer = await bedrockService.askCoachQuestion(userContext, userPrompt);

  // Persist Q&A conversation into PostgreSQL ai_coaching table
  const coachingRes = await query(
    `INSERT INTO ai_coaching ("userId", "coachingType", "userPrompt", summary, strengths, "areasToImprove", recommendations)
     VALUES ($1, 'CHAT', $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      userPrompt,
      aiAnswer.summary || 'AI coaching response generated.',
      JSON.stringify(aiAnswer.strengths || []),
      JSON.stringify(aiAnswer.areasToImprove || []),
      JSON.stringify(aiAnswer.recommendations || []),
    ]
  );

  return parseCoachingRow(coachingRes.rows[0]);
}

/**
 * Delete a specific AI coaching session or chat entry from PostgreSQL.
 */
async function deleteCoachingSession(userId, coachingId) {
  const res = await query(
    'DELETE FROM ai_coaching WHERE id = $1 AND "userId" = $2 RETURNING id',
    [coachingId, userId]
  );

  if (res.rows.length === 0) {
    const err = new Error('Coaching entry not found or unauthorized.');
    err.statusCode = 404;
    throw err;
  }

  return { status: 'success', deletedId: coachingId };
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
