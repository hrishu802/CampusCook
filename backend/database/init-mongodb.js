require('dotenv').config();
const { connectDB, mongoose } = require('../config/database');
const Category = require('../models/Category');

const categories = [
  { name: 'Vegetarian', description: 'Recipes without meat - perfect for vegetarian students' },
  { name: 'Non-Vegetarian', description: 'Recipes with meat, chicken, or fish' },
  { name: 'Desserts', description: 'Sweet dishes and treats for satisfying your sweet tooth' },
  { name: 'Breakfast', description: 'Morning meals to start your day right' },
  { name: 'Lunch', description: 'Midday meals that are filling and nutritious' },
  { name: 'Dinner', description: 'Evening meals perfect for winding down' },
  { name: 'Snacks', description: 'Quick bites for study sessions or between classes' },
  { name: 'Beverages', description: 'Drinks, smoothies, and refreshing beverages' },
  { name: 'Quick & Easy', description: 'Recipes that can be made in under 30 minutes' },
  { name: 'Budget-Friendly', description: 'Affordable recipes perfect for student budgets' }
];

async function initializeDatabase() {
  try {
    console.log('Starting MongoDB database initialization...\n');
    
    // Connect to MongoDB
    await connectDB();
    
    console.log('\nChecking for existing data...');
    const existingCategories = await Category.countDocuments();
    
    if (existingCategories > 0) {
      console.log(`✓ Found ${existingCategories} existing categories, skipping seed data\n`);
    } else {
      console.log('Inserting seed data...');
      await Category.insertMany(categories);
      console.log(`✓ Inserted ${categories.length} categories\n`);
    }
    
    // Display collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Database initialization completed successfully!\n');
    console.log('Collections:');
    collections.forEach(col => {
      console.log(`  ✓ ${col.name}`);
    });
    
    console.log('\nYou can now start the server with: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed!');
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Troubleshooting:');
      console.error('  - Make sure MongoDB is running');
      console.error('  - Install MongoDB: brew install mongodb-community');
      console.error('  - Start MongoDB: brew services start mongodb-community');
      console.error('  - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
    }
    
    console.error('\n📝 Make sure you have MONGODB_URI in your .env file:');
    console.error('  MONGODB_URI=mongodb://localhost:27017/campuscook');
    console.error('  Or for MongoDB Atlas:');
    console.error('  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campuscook\n');
    
    process.exit(1);
  }
}

initializeDatabase();
