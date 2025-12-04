const Recipe = require('../models/Recipe');
const Category = require('../models/Category');
const Rating = require('../models/Rating');
const Favorite = require('../models/Favorite');

// @desc    Get all recipes with pagination, search, filter, and sort
// @route   GET /api/recipes
// @access  Public
const getAllRecipes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search functionality (title, description, ingredients)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    if (sort === 'rating') {
      // For rating sort, we'll need to aggregate with ratings
      // For now, sort by createdAt as fallback
      sortObj.createdAt = order === 'asc' ? 1 : -1;
    } else if (sort === 'popularity') {
      // Popularity could be based on favorites count (implement later)
      sortObj.createdAt = order === 'asc' ? 1 : -1;
    } else if (sort === 'prepTime') {
      sortObj.prep_time = order === 'asc' ? 1 : -1;
    } else {
      sortObj[sort] = order === 'asc' ? 1 : -1;
    }

    // Get total count for pagination
    const totalRecipes = await Recipe.countDocuments(query);
    const totalPages = Math.ceil(totalRecipes / limitNum);

    // Get recipes
    const recipes = await Recipe.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('author_id', 'name email');

    // Get average ratings for each recipe
    const recipesWithRatings = await Promise.all(
      recipes.map(async (recipe) => {
        const ratings = await Rating.find({ recipe_id: recipe._id });
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;
        
        return {
          id: recipe._id,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          prep_time: recipe.prep_time,
          difficulty: recipe.difficulty,
          category: recipe.category,
          image_url: recipe.image_url,
          author: {
            id: recipe.author_id._id,
            name: recipe.author_id.name,
            email: recipe.author_id.email
          },
          averageRating: Math.round(averageRating * 10) / 10,
          ratingCount: ratings.length,
          createdAt: recipe.createdAt,
          updatedAt: recipe.updatedAt
        };
      })
    );

    res.status(200).json({
      recipes: recipesWithRatings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecipes,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching recipes'
    });
  }
};

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, prep_time, difficulty, category, image_url } = req.body;

    // Validate required fields
    if (!title || !ingredients || !steps || !category) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title, ingredients, steps, and category are required'
      });
    }

    // Validate title length
    if (title.trim().length < 5 || title.trim().length > 200) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title must be between 5 and 200 characters'
      });
    }

    // Validate ingredients array
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'At least one ingredient is required'
      });
    }

    // Validate steps array
    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'At least one preparation step is required'
      });
    }

    // Validate prep_time if provided
    if (prep_time !== undefined && (prep_time < 1 || !Number.isInteger(prep_time))) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Preparation time must be a positive integer'
      });
    }

    // Validate category exists
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Category '${category}' does not exist`
      });
    }

    // Create recipe
    const recipe = await Recipe.create({
      title: title.trim(),
      description: description?.trim(),
      ingredients,
      steps,
      prep_time,
      difficulty,
      category,
      image_url: image_url?.trim(),
      author_id: req.user.userId
    });

    // Populate author information
    await recipe.populate('author_id', 'name email');

    res.status(201).json({
      recipe: {
        id: recipe._id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        prep_time: recipe.prep_time,
        difficulty: recipe.difficulty,
        category: recipe.category,
        image_url: recipe.image_url,
        author: {
          id: recipe.author_id._id,
          name: recipe.author_id.name,
          email: recipe.author_id.email
        },
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt
      }
    });

  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while creating the recipe'
    });
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author_id', 'name email');

    if (!recipe) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Recipe not found'
      });
    }

    // Get ratings
    const ratings = await Rating.find({ recipe_id: recipe._id });
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Check if favorited by current user (if authenticated)
    let isFavorited = false;
    if (req.user && req.user.userId) {
      const favorite = await Favorite.findOne({
        user_id: req.user.userId,
        recipe_id: recipe._id
      });
      isFavorited = !!favorite;
    }

    res.status(200).json({
      recipe: {
        id: recipe._id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        prep_time: recipe.prep_time,
        difficulty: recipe.difficulty,
        category: recipe.category,
        image_url: recipe.image_url,
        author: {
          id: recipe.author_id._id,
          name: recipe.author_id.name,
          email: recipe.author_id.email
        },
        averageRating: Math.round(averageRating * 10) / 10,
        ratingCount: ratings.length,
        isFavorited,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt
      }
    });

  } catch (error) {
    console.error('Get recipe error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid recipe ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the recipe'
    });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Recipe not found'
      });
    }

    // Check if user owns the recipe or is admin
    if (recipe.author_id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Authorization Error',
        message: 'You do not have permission to edit this recipe'
      });
    }

    const { title, description, ingredients, steps, prep_time, difficulty, category, image_url } = req.body;

    // Validate fields if provided
    if (title !== undefined) {
      if (title.trim().length < 5 || title.trim().length > 200) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Title must be between 5 and 200 characters'
        });
      }
      recipe.title = title.trim();
    }

    if (description !== undefined) {
      recipe.description = description.trim();
    }

    if (ingredients !== undefined) {
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'At least one ingredient is required'
        });
      }
      recipe.ingredients = ingredients;
    }

    if (steps !== undefined) {
      if (!Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'At least one preparation step is required'
        });
      }
      recipe.steps = steps;
    }

    if (prep_time !== undefined) {
      if (prep_time < 1 || !Number.isInteger(prep_time)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Preparation time must be a positive integer'
        });
      }
      recipe.prep_time = prep_time;
    }

    if (difficulty !== undefined) {
      recipe.difficulty = difficulty;
    }

    if (category !== undefined) {
      const categoryExists = await Category.findOne({ name: category });
      if (!categoryExists) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `Category '${category}' does not exist'`
        });
      }
      recipe.category = category;
    }

    if (image_url !== undefined) {
      recipe.image_url = image_url.trim();
    }

    await recipe.save();
    await recipe.populate('author_id', 'name email');

    res.status(200).json({
      recipe: {
        id: recipe._id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        prep_time: recipe.prep_time,
        difficulty: recipe.difficulty,
        category: recipe.category,
        image_url: recipe.image_url,
        author: {
          id: recipe.author_id._id,
          name: recipe.author_id.name,
          email: recipe.author_id.email
        },
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt
      }
    });

  } catch (error) {
    console.error('Update recipe error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid recipe ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while updating the recipe'
    });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private (Owner or Admin)
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Recipe not found'
      });
    }

    // Check if user owns the recipe or is admin
    if (recipe.author_id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Authorization Error',
        message: 'You do not have permission to delete this recipe'
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Recipe deleted successfully'
    });

  } catch (error) {
    console.error('Delete recipe error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid recipe ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while deleting the recipe'
    });
  }
};

// @desc    Get user's recipes
// @route   GET /api/recipes/user/:userId
// @access  Public
const getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.params;

    const recipes = await Recipe.find({ author_id: userId })
      .populate('author_id', 'name email')
      .sort({ createdAt: -1 });

    const recipesWithStats = await Promise.all(
      recipes.map(async (recipe) => {
        const ratings = await Rating.find({ recipe_id: recipe._id });
        const favorites = await Favorite.countDocuments({ recipe_id: recipe._id });
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

        return {
          id: recipe._id,
          title: recipe.title,
          description: recipe.description,
          category: recipe.category,
          image_url: recipe.image_url,
          prep_time: recipe.prep_time,
          difficulty: recipe.difficulty,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingCount: ratings.length,
          favoriteCount: favorites,
          createdAt: recipe.createdAt
        };
      })
    );

    res.status(200).json({ recipes: recipesWithStats });

  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching user recipes'
    });
  }
};

module.exports = {
  getAllRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getUserRecipes
};
