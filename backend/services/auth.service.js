const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

const SALT_ROUNDS = 12;

/**
 * Generate a signed JWT for the given user.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Strip sensitive fields from user object.
 */
function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * Register a new user.
 * @returns {{ user, token }}
 */
async function register({ email, password, name, fitnessLevel, primaryGoal, workoutFrequency }) {
  // Check for existing user
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('A user with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const res = await query(
    `INSERT INTO users (email, name, "passwordHash", "fitnessLevel", "primaryGoal", "workoutFrequency")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      email,
      name,
      hashedPassword,
      fitnessLevel || null,
      primaryGoal || null,
      workoutFrequency || null,
    ]
  );

  const user = res.rows[0];
  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * Authenticate an existing user.
 * @returns {{ user, token }}
 */
async function login({ email, password }) {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (res.rows.length === 0) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const user = res.rows[0];
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * Get the authenticated user's profile.
 */
async function getProfile(userId) {
  const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (res.rows.length === 0) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return sanitizeUser(res.rows[0]);
}

module.exports = { register, login, getProfile };
