const express = require('express');
const router = express.Router();
const {
  getAllRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getUserRecipes
} = require('../controllers/recipeController');
const { authenticateToken, authorizeRole, optionalAuth } = require('../middleware/auth');

// Public routes (with optional auth for favorite status)
router.get('/', getAllRecipes);
router.get('/user/:userId', getUserRecipes);
router.get('/:id', optionalAuth, getRecipeById);

// Protected routes (require authentication)
router.post('/', authenticateToken, createRecipe);
router.put('/:id', authenticateToken, updateRecipe);

// Delete route (owner or admin)
router.delete('/:id', authenticateToken, deleteRecipe);

module.exports = router;
