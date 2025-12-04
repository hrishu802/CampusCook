const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Recipe is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },
  review: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review must not exceed 1000 characters']
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

// Compound unique index to ensure one rating per user per recipe
ratingSchema.index({ user_id: 1, recipe_id: 1 }, { unique: true });

// Index for recipe ratings lookup
ratingSchema.index({ recipe_id: 1 });

// Index for user ratings lookup
ratingSchema.index({ user_id: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
