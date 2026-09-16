const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', authController.register);

// POST /api/v1/auth/login
router.post('/login', authController.login);

// POST /api/v1/auth/logout (requires auth)
router.post('/logout', authMiddleware, authController.logout);

// GET  /api/v1/auth/me (requires auth)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
