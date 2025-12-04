const express = require('express');
const router = express.Router();
const { addOrUpdateRating, getRecipeRatings } = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/recipe/:recipeId', getRecipeRatings);

// Protected routes
router.post('/:recipeId', authenticateToken, addOrUpdateRating);

module.exports = router;
