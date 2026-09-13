const authService = require('../services/auth.service');

/**
 * POST /api/v1/auth/register
 */
async function register(req, res) {
  try {
    const { email, password, name, fitnessLevel, primaryGoal, workoutFrequency } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const result = await authService.register({
      email,
      password,
      name,
      fitnessLevel,
      primaryGoal,
      workoutFrequency,
    });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * POST /api/v1/auth/logout
 * With JWT, logout is stateless — the client discards the token.
 * This endpoint exists for API completeness (TRD §20).
 */
async function logout(_req, res) {
  return res.json({ message: 'Logged out successfully.' });
}

/**
 * GET /api/v1/auth/me
 */
async function getMe(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);
    return res.json({ user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = { register, login, logout, getMe };
