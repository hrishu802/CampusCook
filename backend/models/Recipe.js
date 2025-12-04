const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title must not exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  ingredients: {
    type: [String],
    required: [true, 'Ingredients are required'],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'At least one ingredient is required'
    }
  },
  steps: {
    type: [String],
    required: [true, 'Preparation steps are required'],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'At least one preparation step is required'
    }
  },
  prep_time: {
    type: Number,
    min: [1, 'Preparation time must be at least 1 minute']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium, or hard'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  image_url: {
    type: String,
    trim: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
recipeSchema.index({ category: 1 });
recipeSchema.index({ author_id: 1 });
recipeSchema.index({ title: 1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ title: 'text', description: 'text' }); // Text search

module.exports = mongoose.model('Recipe', recipeSchema);
