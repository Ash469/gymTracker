const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

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
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('A user with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      fitnessLevel: fitnessLevel || null,
      primaryGoal: primaryGoal || null,
      workoutFrequency: workoutFrequency || null,
    },
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * Authenticate an existing user.
 * @returns {{ user, token }}
 */
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return sanitizeUser(user);
}

module.exports = { register, login, getProfile };
