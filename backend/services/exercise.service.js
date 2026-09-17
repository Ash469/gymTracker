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
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(exerciseId);
  const sql = isUuid
    ? 'SELECT * FROM exercises WHERE id = $1 OR slug = $1'
    : 'SELECT * FROM exercises WHERE slug = $1 OR name ILIKE $1';

  const res = await query(sql, [exerciseId]);

  if (res.rows.length === 0) {
    const err = new Error('Exercise not found.');
    err.statusCode = 404;
    throw err;
  }

  return res.rows[0];
}

module.exports = { listExercises, getExercise };
