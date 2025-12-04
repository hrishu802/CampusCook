const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');

// @desc    Add recipe to favorites
// @route   POST /api/favorites/:recipeId
// @access  Private
const addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Recipe not found'
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      user_id: req.user.userId,
      recipe_id: recipeId
    });

    if (existing) {
      return res.status(200).json({
        message: 'Recipe already in favorites',
        favorite: { id: existing._id }
      });
    }

    // Create favorite
    const favorite = await Favorite.create({
      user_id: req.user.userId,
      recipe_id: recipeId
    });

    res.status(201).json({
      message: 'Recipe added to favorites',
      favorite: { id: favorite._id }
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while adding favorite'
    });
  }
};

// @desc    Remove recipe from favorites
// @route   DELETE /api/favorites/:recipeId
// @access  Private
const removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user_id: req.user.userId,
      recipe_id: recipeId
    });

    if (!favorite) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      message: 'Recipe removed from favorites'
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while removing favorite'
    });
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user_id: req.user.userId })
      .populate({
        path: 'recipe_id',
        populate: { path: 'author_id', select: 'name email' }
      });

    const recipes = favorites.map(fav => ({
      id: fav.recipe_id._id,
      title: fav.recipe_id.title,
      description: fav.recipe_id.description,
      ingredients: fav.recipe_id.ingredients,
      steps: fav.recipe_id.steps,
      prep_time: fav.recipe_id.prep_time,
      difficulty: fav.recipe_id.difficulty,
      category: fav.recipe_id.category,
      image_url: fav.recipe_id.image_url,
      author: {
        id: fav.recipe_id.author_id._id,
        name: fav.recipe_id.author_id.name,
        email: fav.recipe_id.author_id.email
      },
      favoritedAt: fav.createdAt
    }));

    res.status(200).json({ recipes });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching favorites'
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites
};
