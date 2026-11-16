const prisma = require('../db');

/**
 * Create a new workout session (status = ACTIVE).
 * TRD §23: POST /api/v1/workouts
 */
async function createWorkout(userId) {
  return prisma.workout.create({
    data: { userId },
  });
}

/**
 * Get a single workout with all sets and feedback (scoped to user).
 * TRD §23: GET /api/v1/workouts/:workoutId
 */
async function getWorkout(userId, workoutId) {
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId },
    include: {
      workoutSets: {
        orderBy: { setNumber: 'asc' },
        include: {
          exercise: { select: { id: true, name: true, muscleGroup: true } },
          formFeedback: true,
        },
      },
    },
  });

  if (!workout) {
    const err = new Error('Workout not found.');
    err.statusCode = 404;
    throw err;
  }

  return workout;
}

/**
 * List all workouts for a user (newest first).
 * TRD §23: GET /api/v1/workouts
 */
async function listWorkouts(userId) {
  return prisma.workout.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: {
      workoutSets: {
        orderBy: { setNumber: 'asc' },
        include: {
          exercise: { select: { id: true, name: true } },
        },
      },
    },
  });
}

/**
 * Complete a workout — calculate overall score, set status to COMPLETED.
 * TRD §23: PATCH /api/v1/workouts/:workoutId/complete
 */
async function completeWorkout(userId, workoutId, data = {}) {
  const workout = await getWorkout(userId, workoutId);

  if (workout.status !== 'ACTIVE') {
    const err = new Error(`Workout is already ${workout.status.toLowerCase()}.`);
    err.statusCode = 400;
    throw err;
  }

  // Calculate overall score from set averages
  const scores = workout.workoutSets
    .map((s) => s.averageScore)
    .filter(Boolean);
  const overallScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null;

  // Calculate duration from sets, or fallback to elapsed time or caller data
  const setsDuration = workout.workoutSets.reduce((sum, s) => sum + (s.duration || 0), 0);
  const elapsedTime = Math.round((Date.now() - new Date(workout.startedAt).getTime()) / 1000);
  const duration = data.duration ?? (setsDuration > 0 ? setsDuration : elapsedTime);

  // If workout was created right before completion, backdate startedAt to reflect actual duration
  const completedAt = new Date();
  const adjustedStartedAt = (elapsedTime <= 2 && duration > 0)
    ? new Date(completedAt.getTime() - duration * 1000)
    : workout.startedAt;

  return prisma.workout.update({
    where: { id: workoutId },
    data: {
      status: 'COMPLETED',
      startedAt: adjustedStartedAt,
      completedAt,
      overallScore,
      duration,
    },
    include: {
      workoutSets: {
        orderBy: { setNumber: 'asc' },
        include: {
          exercise: { select: { id: true, name: true, muscleGroup: true } },
          formFeedback: true,
        },
      },
    },
  });
}

/**
 * Abandon a workout.
 */
async function abandonWorkout(userId, workoutId) {
  await getWorkout(userId, workoutId);

  return prisma.workout.update({
    where: { id: workoutId },
    data: {
      status: 'ABANDONED',
      completedAt: new Date(),
    },
  });
}

/**
 * Add a set to an active workout.
 * TRD §24: POST /api/v1/workouts/:workoutId/sets
 */
async function addSet(userId, workoutId, data) {
  const workout = await getWorkout(userId, workoutId);

  if (workout.status !== 'ACTIVE') {
    const err = new Error('Cannot add sets to a non-active workout.');
    err.statusCode = 400;
    throw err;
  }

  // Auto-increment set number per exercise within this workout
  const existingSets = workout.workoutSets.filter(
    (s) => s.exercise.id === data.exerciseId
  );
  const setNumber = existingSets.length + 1;

  // Create the set with form feedback in a transaction
  const set = await prisma.workoutSet.create({
    data: {
      workoutId,
      exerciseId: data.exerciseId,
      setNumber,
      reps: data.reps ?? 0,
      averageScore: data.averageScore ?? null,
      bestScore: data.bestScore ?? null,
      worstScore: data.worstScore ?? null,
      duration: data.duration ?? null,
      formFeedback: data.errors
        ? {
            create: Object.entries(data.errors).map(([errorType, count]) => ({
              errorType,
              severity: 'MEDIUM',
              occurrenceCount: typeof count === 'number' ? count : 1,
            })),
          }
        : undefined,
    },
    include: {
      exercise: { select: { id: true, name: true, muscleGroup: true } },
      formFeedback: true,
    },
  });

  return set;
}

/**
 * Get a single set by ID.
 * TRD §24: GET /api/v1/sets/:setId
 */
async function getSet(userId, setId) {
  const set = await prisma.workoutSet.findFirst({
    where: {
      id: setId,
      workout: { userId },
    },
    include: {
      exercise: { select: { id: true, name: true, muscleGroup: true } },
      formFeedback: true,
    },
  });

  if (!set) {
    const err = new Error('Set not found.');
    err.statusCode = 404;
    throw err;
  }

  return set;
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
