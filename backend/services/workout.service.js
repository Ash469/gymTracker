const { query, getClient } = require('../db');

/**
 * Create a new workout session (status = ACTIVE).
 */
async function createWorkout(userId) {
  const res = await query(
    'INSERT INTO workouts ("userId") VALUES ($1) RETURNING *',
    [userId]
  );
  return res.rows[0];
}

/**
 * Get a single workout with all sets and feedback (scoped to user).
 */
async function getWorkout(userId, workoutId) {
  const workoutRes = await query(
    'SELECT * FROM workouts WHERE id = $1 AND "userId" = $2',
    [workoutId, userId]
  );

  if (workoutRes.rows.length === 0) {
    const err = new Error('Workout not found.');
    err.statusCode = 404;
    throw err;
  }

  const workout = workoutRes.rows[0];

  // Fetch sets with exercises
  const setsRes = await query(
    `SELECT ws.*, e.name as "exerciseName", e."muscleGroup" as "exerciseMuscleGroup"
     FROM workout_sets ws
     JOIN exercises e ON ws."exerciseId" = e.id
     WHERE ws."workoutId" = $1
     ORDER BY ws."setNumber" ASC`,
    [workoutId]
  );

  const setIds = setsRes.rows.map((r) => r.id);

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

  workout.workoutSets = setsRes.rows.map((r) => {
    const { exerciseName, exerciseMuscleGroup, ...setFields } = r;
    return {
      ...setFields,
      exercise: {
        id: r.exerciseId,
        name: exerciseName,
        muscleGroup: exerciseMuscleGroup,
      },
      formFeedback: feedbackMap[r.id] || [],
    };
  });

  return workout;
}

/**
 * List all workouts for a user (newest first).
 */
async function listWorkouts(userId) {
  const workoutsRes = await query(
    'SELECT * FROM workouts WHERE "userId" = $1 ORDER BY "startedAt" DESC',
    [userId]
  );

  const workouts = workoutsRes.rows;
  if (workouts.length === 0) return [];

  const workoutIds = workouts.map((w) => w.id);

  const setsRes = await query(
    `SELECT ws.*, e.name as "exerciseName"
     FROM workout_sets ws
     JOIN exercises e ON ws."exerciseId" = e.id
     WHERE ws."workoutId" = ANY($1::uuid[])
     ORDER BY ws."setNumber" ASC`,
    [workoutIds]
  );

  const setsByWorkout = {};
  for (const r of setsRes.rows) {
    const { exerciseName, ...setFields } = r;
    if (!setsByWorkout[r.workoutId]) setsByWorkout[r.workoutId] = [];
    setsByWorkout[r.workoutId].push({
      ...setFields,
      exercise: {
        id: r.exerciseId,
        name: exerciseName,
      },
    });
  }

  return workouts.map((w) => ({
    ...w,
    workoutSets: setsByWorkout[w.id] || [],
  }));
}

/**
 * Complete a workout — calculate overall score, set status to COMPLETED.
 */
async function completeWorkout(userId, workoutId, data = {}) {
  const workout = await getWorkout(userId, workoutId);

  if (workout.status !== 'ACTIVE') {
    const err = new Error(`Workout is already ${workout.status.toLowerCase()}.`);
    err.statusCode = 400;
    throw err;
  }

  const scores = workout.workoutSets
    .map((s) => s.averageScore)
    .filter(Boolean);
  const overallScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null;

  const setsDuration = workout.workoutSets.reduce((sum, s) => sum + (s.duration || 0), 0);
  const elapsedTime = Math.round((Date.now() - new Date(workout.startedAt).getTime()) / 1000);
  const duration = data.duration ?? (setsDuration > 0 ? setsDuration : elapsedTime);

  const completedAt = new Date();
  const adjustedStartedAt = (elapsedTime <= 2 && duration > 0)
    ? new Date(completedAt.getTime() - duration * 1000)
    : workout.startedAt;

  await query(
    `UPDATE workouts
     SET status = 'COMPLETED', "startedAt" = $1, "completedAt" = $2, "overallScore" = $3, duration = $4, "updatedAt" = NOW()
     WHERE id = $5`,
    [adjustedStartedAt, completedAt, overallScore, duration, workoutId]
  );

  return getWorkout(userId, workoutId);
}

/**
 * Abandon a workout.
 */
async function abandonWorkout(userId, workoutId) {
  await getWorkout(userId, workoutId);

  const res = await query(
    `UPDATE workouts
     SET status = 'ABANDONED', "completedAt" = NOW(), "updatedAt" = NOW()
     WHERE id = $1
     RETURNING *`,
    [workoutId]
  );

  return res.rows[0];
}

/**
 * Add a set to an active workout.
 */
async function addSet(userId, workoutId, data) {
  const workout = await getWorkout(userId, workoutId);

  if (workout.status !== 'ACTIVE') {
    const err = new Error('Cannot add sets to a non-active workout.');
    err.statusCode = 400;
    throw err;
  }

  const existingSets = workout.workoutSets.filter(
    (s) => s.exercise.id === data.exerciseId
  );
  const setNumber = existingSets.length + 1;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const setRes = await client.query(
      `INSERT INTO workout_sets ("workoutId", "exerciseId", "setNumber", reps, "averageScore", "bestScore", "worstScore", duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        workoutId,
        data.exerciseId,
        setNumber,
        data.reps ?? 0,
        data.averageScore ?? null,
        data.bestScore ?? null,
        data.worstScore ?? null,
        data.duration ?? null,
      ]
    );

    const newSetRow = setRes.rows[0];

    const feedbackRows = [];
    if (data.errors && Object.keys(data.errors).length > 0) {
      for (const [errorType, count] of Object.entries(data.errors)) {
        const occurrenceCount = typeof count === 'number' ? count : 1;
        const fbRes = await client.query(
          `INSERT INTO form_feedback ("setId", "errorType", severity, "occurrenceCount")
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [newSetRow.id, errorType, 'MEDIUM', occurrenceCount]
        );
        feedbackRows.push(fbRes.rows[0]);
      }
    }

    const exRes = await client.query(
      'SELECT id, name, "muscleGroup" FROM exercises WHERE id = $1',
      [data.exerciseId]
    );

    await client.query('COMMIT');

    return {
      ...newSetRow,
      exercise: exRes.rows[0] || null,
      formFeedback: feedbackRows,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get a single set by ID.
 */
async function getSet(userId, setId) {
  const setRes = await query(
    `SELECT ws.*, e.name as "exerciseName", e."muscleGroup" as "exerciseMuscleGroup"
     FROM workout_sets ws
     JOIN workouts w ON ws."workoutId" = w.id
     JOIN exercises e ON ws."exerciseId" = e.id
     WHERE ws.id = $1 AND w."userId" = $2`,
    [setId, userId]
  );

  if (setRes.rows.length === 0) {
    const err = new Error('Set not found.');
    err.statusCode = 404;
    throw err;
  }

  const r = setRes.rows[0];
  const feedbackRes = await query(
    'SELECT * FROM form_feedback WHERE "setId" = $1',
    [setId]
  );

  const { exerciseName, exerciseMuscleGroup, ...setFields } = r;

  return {
    ...setFields,
    exercise: {
      id: r.exerciseId,
      name: exerciseName,
      muscleGroup: exerciseMuscleGroup,
    },
    formFeedback: feedbackRes.rows,
  };
}

module.exports = {
  createWorkout,
  getWorkout,
  listWorkouts,
  completeWorkout,
  abandonWorkout,
  addSet,
  getSet,
};
