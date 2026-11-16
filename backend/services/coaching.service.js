const prisma = require('../db');
const bedrockService = require('./bedrock.service');

/**
 * Request AI coaching analysis for a completed workout.
 * Collects workout + historical data, calls Bedrock, persists result.
 */
async function analyzeWorkout(userId, workoutId) {
  // 1. Fetch the target workout with all sets and feedback
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId },
    include: {
      workoutSets: {
        include: {
          exercise: { select: { name: true, muscleGroup: true } },
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

  // 2. Fetch historical context — previous completed workouts
  const previousWorkouts = await prisma.workout.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      id: { not: workoutId },
    },
    orderBy: { completedAt: 'desc' },
    take: 5,
    select: {
      overallScore: true,
      completedAt: true,
      workoutSets: {
        select: {
          exercise: { select: { name: true } },
          reps: true,
          averageScore: true,
        },
      },
    },
  });

  // 3. Compute historical average
  const previousScores = previousWorkouts
    .map((w) => w.overallScore)
    .filter(Boolean);
  const previousAverage =
    previousScores.length > 0
      ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length
      : null;

  // 4. Build structured AI input (TRD §27)
  const aiInput = {
    currentWorkout: {
      overallScore: workout.overallScore,
      exercises: workout.workoutSets.map((s) => ({
        name: s.exercise.name,
        muscleGroup: s.exercise.muscleGroup,
        reps: s.reps,
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
          : workout.overallScore >= previousAverage
            ? 'improving'
            : 'declining',
      totalPreviousWorkouts: previousWorkouts.length,
    },
  };

  // 5. Call Bedrock (or stub)
  const aiResponse = await bedrockService.getWorkoutRecommendations(aiInput);

  // 6. Persist coaching result
  const coaching = await prisma.aICoaching.create({
    data: {
      userId,
      workoutId,
      summary: aiResponse.summary || 'AI coaching analysis completed.',
      strengths: aiResponse.strengths || [],
      areasToImprove: aiResponse.areasToImprove || [],
      recommendations: aiResponse.recommendations || [],
    },
  });

  return coaching;
}

/**
 * Get all coaching sessions for a user.
 */
async function getCoachingHistory(userId) {
  return prisma.aICoaching.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      workout: {
        select: { id: true, overallScore: true, completedAt: true },
      },
    },
  });
}

/**
 * Get a specific coaching session.
 */
async function getCoachingById(userId, coachingId) {
  const coaching = await prisma.aICoaching.findFirst({
    where: { id: coachingId, userId },
    include: {
      workout: {
        select: { id: true, overallScore: true, completedAt: true },
      },
    },
  });

  if (!coaching) {
    const err = new Error('Coaching session not found.');
    err.statusCode = 404;
    throw err;
  }

  return coaching;
}

module.exports = { analyzeWorkout, getCoachingHistory, getCoachingById };
