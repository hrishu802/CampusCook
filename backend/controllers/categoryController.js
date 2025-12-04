const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

// @desc    Get all categories with recipe counts
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    
    // Get recipe count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const recipeCount = await Recipe.countDocuments({ category: category.name });
        return {
          id: category._id,
          name: category.name,
          description: category.description,
          recipeCount,
          createdAt: category.createdAt
        };
      })
    );

    res.status(200).json({
      categories: categoriesWithCounts
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching categories'
    });
  }
};

module.exports = {
  getAllCategories
};
