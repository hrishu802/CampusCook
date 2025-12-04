const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getUserFavorites } = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticateToken, getUserFavorites);
router.post('/:recipeId', authenticateToken, addFavorite);
router.delete('/:recipeId', authenticateToken, removeFavorite);

module.exports = router;
