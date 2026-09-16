const { query } = require('../db');

/**
 * Get overall progress for a user.
 * Returns aggregate stats and per-exercise trends.
 */
async function getOverallProgress(userId) {
  // Total workout count
  const countRes = await query(
    'SELECT COUNT(*)::int as count FROM workouts WHERE "userId" = $1 AND status = \'COMPLETED\'',
    [userId]
  );
  const totalWorkouts = countRes.rows[0]?.count || 0;

  // Average and max overall score
  const scoreRes = await query(
    `SELECT AVG("overallScore")::float as "averageScore", MAX("overallScore")::float as "bestScore"
     FROM workouts
     WHERE "userId" = $1 AND status = 'COMPLETED' AND "overallScore" IS NOT NULL`,
    [userId]
  );
  const averageScore = scoreRes.rows[0]?.averageScore ? Math.round(scoreRes.rows[0].averageScore * 10) / 10 : null;
  const bestScore = scoreRes.rows[0]?.bestScore != null ? parseFloat(scoreRes.rows[0].bestScore) : null;

  // Recent workouts with sets for trend chart
  const recentWorkoutsRes = await query(
    `SELECT id, "overallScore", "completedAt", duration
     FROM workouts
     WHERE "userId" = $1 AND status = 'COMPLETED'
     ORDER BY "completedAt" DESC
     LIMIT 20`,
    [userId]
  );

  const recentWorkouts = recentWorkoutsRes.rows.map((w) => ({
    id: w.id,
    overallScore: w.overallScore != null ? parseFloat(w.overallScore) : null,
    completedAt: w.completedAt,
    duration: w.duration,
    workoutSets: [],
  }));

  if (recentWorkouts.length > 0) {
    const workoutIds = recentWorkouts.map((w) => w.id);
    const setsRes = await query(
      `SELECT ws."workoutId", ws.reps, ws."averageScore", e.name as "exerciseName"
       FROM workout_sets ws
       JOIN exercises e ON ws."exerciseId" = e.id
       WHERE ws."workoutId" = ANY($1::uuid[])`,
      [workoutIds]
    );

    const setsByWorkout = {};
    for (const s of setsRes.rows) {
      if (!setsByWorkout[s.workoutId]) setsByWorkout[s.workoutId] = [];
      setsByWorkout[s.workoutId].push({
        exercise: { name: s.exerciseName },
        reps: s.reps,
        averageScore: s.averageScore != null ? parseFloat(s.averageScore) : null,
      });
    }

    for (const w of recentWorkouts) {
      w.workoutSets = setsByWorkout[w.id] || [];
    }
  }

  // Top errors across all sets
  const topErrorsRes = await query(
    `SELECT ff."errorType", SUM(ff."occurrenceCount")::int as "totalOccurrences"
     FROM form_feedback ff
     JOIN workout_sets ws ON ff."setId" = ws.id
     JOIN workouts w ON ws."workoutId" = w.id
     WHERE w."userId" = $1 AND w.status = 'COMPLETED'
     GROUP BY ff."errorType"
     ORDER BY "totalOccurrences" DESC
     LIMIT 5`,
    [userId]
  );

  return {
    totalWorkouts,
    averageScore,
    bestScore,
    recentWorkouts,
    topErrors: topErrorsRes.rows,
  };
}

/**
 * Get progress for a specific exercise.
 */
async function getExerciseProgress(userId, exerciseId) {
  // All sets for this exercise from completed workouts, ordered by date
  const setsRes = await query(
    `SELECT ws.id, ws."setNumber", ws.reps, ws."averageScore", ws."bestScore", ws."worstScore", ws.duration, ws."createdAt"
     FROM workout_sets ws
     JOIN workouts w ON ws."workoutId" = w.id
     WHERE ws."exerciseId" = $1 AND w."userId" = $2 AND w.status = 'COMPLETED'
     ORDER BY ws."createdAt" DESC
     LIMIT 50`,
    [exerciseId, userId]
  );

  const setIds = setsRes.rows.map((s) => s.id);
  let feedbackMap = {};
  if (setIds.length > 0) {
    const feedbackRes = await query(
      'SELECT "setId", "errorType", severity, "occurrenceCount" FROM form_feedback WHERE "setId" = ANY($1::uuid[])',
      [setIds]
    );
    for (const fb of feedbackRes.rows) {
      if (!feedbackMap[fb.setId]) feedbackMap[fb.setId] = [];
      feedbackMap[fb.setId].push(fb);
    }
  }

  const sets = setsRes.rows.map((s) => ({
    ...s,
    averageScore: s.averageScore != null ? parseFloat(s.averageScore) : null,
    bestScore: s.bestScore != null ? parseFloat(s.bestScore) : null,
    worstScore: s.worstScore != null ? parseFloat(s.worstScore) : null,
    formFeedback: feedbackMap[s.id] || [],
  }));

  // Aggregate score for this exercise
  const scoreAggRes = await query(
    `SELECT COUNT(*)::int as "totalSets", AVG("averageScore")::float as "averageScore", MAX("bestScore")::float as "bestScore"
     FROM workout_sets ws
     JOIN workouts w ON ws."workoutId" = w.id
     WHERE ws."exerciseId" = $1 AND w."userId" = $2 AND w.status = 'COMPLETED' AND ws."averageScore" IS NOT NULL`,
    [exerciseId, userId]
  );

  const aggRow = scoreAggRes.rows[0];
  const totalSets = aggRow?.totalSets || 0;
  const averageScore = aggRow?.averageScore ? Math.round(aggRow.averageScore * 10) / 10 : null;
  const bestScore = aggRow?.bestScore != null ? parseFloat(aggRow.bestScore) : null;

  // Most common errors for this exercise
  const topErrorsRes = await query(
    `SELECT ff."errorType", SUM(ff."occurrenceCount")::int as "totalOccurrences"
     FROM form_feedback ff
     JOIN workout_sets ws ON ff."setId" = ws.id
     JOIN workouts w ON ws."workoutId" = w.id
     WHERE ws."exerciseId" = $1 AND w."userId" = $2 AND w.status = 'COMPLETED'
     GROUP BY ff."errorType"
     ORDER BY "totalOccurrences" DESC
     LIMIT 5`,
    [exerciseId, userId]
  );

  return {
    totalSets,
    averageScore,
    bestScore,
    sets,
    topErrors: topErrorsRes.rows,
  };
}

module.exports = { getOverallProgress, getExerciseProgress };
