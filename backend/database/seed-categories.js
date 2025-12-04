const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

const categories = [
  { name: 'breakfast', description: 'Morning meals and breakfast recipes' },
  { name: 'lunch', description: 'Midday meals and lunch recipes' },
  { name: 'dinner', description: 'Evening meals and dinner recipes' },
  { name: 'snack', description: 'Quick snacks and light bites' },
  { name: 'dessert', description: 'Sweet treats and desserts' }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campuscook');
    console.log('✓ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('✓ Cleared existing categories');

    // Insert categories
    await Category.insertMany(categories);
    console.log('✓ Seeded categories:', categories.map(c => c.name).join(', '));

    // Verify
    const count = await Category.countDocuments();
    console.log(`✓ Total categories in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
