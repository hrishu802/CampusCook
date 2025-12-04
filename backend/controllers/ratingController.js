const Rating = require('../models/Rating');
const Recipe = require('../models/Recipe');

// @desc    Add or update rating
// @route   POST /api/ratings/:recipeId
// @access  Private
const addOrUpdateRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { rating, review } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Recipe not found'
      });
    }

    // Check if user already rated
    const existing = await Rating.findOne({
      user_id: req.user.userId,
      recipe_id: recipeId
    });

    if (existing) {
      // Update existing rating
      existing.rating = rating;
      if (review !== undefined) existing.review = review;
      await existing.save();

      return res.status(200).json({
        message: 'Rating updated',
        rating: {
          id: existing._id,
          rating: existing.rating,
          review: existing.review
        }
      });
    }

    // Create new rating
    const newRating = await Rating.create({
      user_id: req.user.userId,
      recipe_id: recipeId,
      rating,
      review
    });

    res.status(201).json({
      message: 'Rating added',
      rating: {
        id: newRating._id,
        rating: newRating.rating,
        review: newRating.review
      }
    });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while adding rating'
    });
  }
};

// @desc    Get recipe ratings
// @route   GET /api/ratings/recipe/:recipeId
// @access  Public
const getRecipeRatings = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const ratings = await Rating.find({ recipe_id: recipeId })
      .populate('user_id', 'name')
      .sort({ createdAt: -1 });

    const ratingsData = ratings.map(r => ({
      id: r._id,
      rating: r.rating,
      review: r.review,
      user: {
        id: r.user_id._id,
        name: r.user_id.name
      },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    // Calculate average
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.status(200).json({
      ratings: ratingsData,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching ratings'
    });
  }
};

module.exports = {
  addOrUpdateRating,
  getRecipeRatings
};
