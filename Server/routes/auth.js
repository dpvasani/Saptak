const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Register
router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim()
], authController.register);

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], authController.login);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Update profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('organization').optional().trim(),
  body('expertise').optional().isArray()
], authController.updateProfile);

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], authController.changePassword);

// Get user activity
router.get('/activity', authenticateToken, authController.getUserActivity);

module.exports = router;