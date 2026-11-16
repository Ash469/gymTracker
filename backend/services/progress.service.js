const prisma = require('../db');

/**
 * Get overall progress for a user.
 * Returns aggregate stats and per-exercise trends.
 */
async function getOverallProgress(userId) {
  // Total workout count
  const totalWorkouts = await prisma.workout.count({
    where: { userId, status: 'COMPLETED' },
  });

  // Average overall score across completed workouts
  const scoreAgg = await prisma.workout.aggregate({
    where: { userId, status: 'COMPLETED', overallScore: { not: null } },
    _avg: { overallScore: true },
    _max: { overallScore: true },
  });

  // Recent workouts with scores for trend chart
  const recentWorkouts = await prisma.workout.findMany({
    where: { userId, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      overallScore: true,
      completedAt: true,
      duration: true,
      workoutSets: {
        select: {
          exercise: { select: { name: true } },
          reps: true,
          averageScore: true,
        },
      },
    },
  });

  // Most common form errors across all sets
  const topErrors = await prisma.formFeedback.groupBy({
    by: ['errorType'],
    where: {
      workoutSet: { workout: { userId, status: 'COMPLETED' } },
    },
    _sum: { occurrenceCount: true },
    orderBy: { _sum: { occurrenceCount: 'desc' } },
    take: 5,
  });

  return {
    totalWorkouts,
    averageScore: scoreAgg._avg.overallScore,
    bestScore: scoreAgg._max.overallScore,
    recentWorkouts,
    topErrors: topErrors.map((e) => ({
      errorType: e.errorType,
      totalOccurrences: e._sum.occurrenceCount,
    })),
  };
}

/**
 * Get progress for a specific exercise.
 */
async function getExerciseProgress(userId, exerciseId) {
  // All sets for this exercise from completed workouts, ordered by date
  const sets = await prisma.workoutSet.findMany({
    where: {
      exerciseId,
      workout: { userId, status: 'COMPLETED' },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      setNumber: true,
      reps: true,
      averageScore: true,
      bestScore: true,
      worstScore: true,
      duration: true,
      createdAt: true,
      formFeedback: {
        select: {
          errorType: true,
          severity: true,
          occurrenceCount: true,
        },
      },
    },
  });

  // Aggregate score for this exercise
  const scoreAgg = await prisma.workoutSet.aggregate({
    where: {
      exerciseId,
      workout: { userId, status: 'COMPLETED' },
      averageScore: { not: null },
    },
    _avg: { averageScore: true },
    _max: { bestScore: true },
    _count: true,
  });

  // Most common errors for this exercise
  const topErrors = await prisma.formFeedback.groupBy({
    by: ['errorType'],
    where: {
      workoutSet: {
        exerciseId,
        workout: { userId, status: 'COMPLETED' },
      },
    },
    _sum: { occurrenceCount: true },
    orderBy: { _sum: { occurrenceCount: 'desc' } },
    take: 5,
  });

  return {
    totalSets: scoreAgg._count,
    averageScore: scoreAgg._avg.averageScore,
    bestScore: scoreAgg._max.bestScore,
    sets,
    topErrors: topErrors.map((e) => ({
      errorType: e.errorType,
      totalOccurrences: e._sum.occurrenceCount,
    })),
  };
}

module.exports = { getOverallProgress, getExerciseProgress };
