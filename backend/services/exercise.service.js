const { query } = require('../db');

/**
 * List all active exercises.
 */
async function listExercises() {
  const res = await query(
    'SELECT * FROM exercises WHERE "isActive" = true ORDER BY name ASC'
  );
  return res.rows;
}

/**
 * Get a single exercise by ID.
 */
async function getExercise(exerciseId) {
  const res = await query('SELECT * FROM exercises WHERE id = $1', [exerciseId]);

  if (res.rows.length === 0) {
    const err = new Error('Exercise not found.');
    err.statusCode = 404;
    throw err;
  }

  return res.rows[0];
}

module.exports = { listExercises, getExercise };
