const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Rating = require('../models/Rating');
const Favorite = require('../models/Favorite');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const totalRatings = await Rating.countDocuments();
    const totalFavorites = await Favorite.countDocuments();

    // Get recent recipes
    const recentRecipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author_id', 'name email');

    const recipesData = recentRecipes.map(r => ({
      id: r._id,
      title: r.title,
      author: r.author_id.name,
      category: r.category,
      createdAt: r.createdAt
    }));

    res.status(200).json({
      statistics: {
        totalUsers,
        totalRecipes,
        totalRatings,
        totalFavorites
      },
      recentRecipes: recipesData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching dashboard data'
    });
  }
};

module.exports = {
  getDashboard
};
