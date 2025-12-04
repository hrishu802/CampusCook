const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Recipe is required']
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

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ user_id: 1, recipe_id: 1 }, { unique: true });

// Index for faster user favorites lookup
favoriteSchema.index({ user_id: 1 });

// Index for recipe popularity
favoriteSchema.index({ recipe_id: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
