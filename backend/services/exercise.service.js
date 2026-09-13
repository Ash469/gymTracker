const prisma = require('../db');

/**
 * List all active exercises.
 */
async function listExercises() {
  return prisma.exercise.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Get a single exercise by ID.
 */
async function getExercise(exerciseId) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    const err = new Error('Exercise not found.');
    err.statusCode = 404;
    throw err;
  }

  return exercise;
}

module.exports = { listExercises, getExercise };
