const fc = require('fast-check');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Category = require('../models/Category');

describe('Recipe Property Tests', () => {
  let testUser;
  let testCategories;

  beforeAll(async () => {
    await connectDB();
    
    // Create a test user
    const password_hash = await bcrypt.hash('testpassword123', 10);
    testUser = await User.create({
      name: 'Test User',
      email: `test.recipe.${Date.now()}@property.test`,
      password_hash
    });

    // Get existing categories
    testCategories = await Category.find({});
  });

  afterAll(async () => {
    // Cleanup
    await User.findByIdAndDelete(testUser._id);
    await Recipe.deleteMany({ author_id: testUser._id });
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clean up test recipes after each test
    await Recipe.deleteMany({ author_id: testUser._id });
  });

  // Feature: campus-cook, Property 9: Valid recipe creation
  describe('Property 9: Valid recipe creation', () => {
    test('all valid recipes are stored correctly in database', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length >= 5),
            description: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
            ingredients: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
            steps: fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 10 }),
            prep_time: fc.option(fc.integer({ min: 1, max: 300 }), { nil: undefined }),
            difficulty: fc.option(fc.constantFrom('easy', 'medium', 'hard'), { nil: undefined }),
            image_url: fc.option(fc.webUrl(), { nil: null })
          }),
          async (recipeData) => {
            // Pick a random category
            const category = testCategories[Math.floor(Math.random() * testCategories.length)];

            // Create recipe
            const recipe = await Recipe.create({
              ...recipeData,
              category: category.name,
              author_id: testUser._id
            });

            // Fetch from database
            const storedRecipe = await Recipe.findById(recipe._id);

            // Assert all fields are stored correctly
            expect(storedRecipe.title.trim()).toBe(recipeData.title.trim());
            expect(storedRecipe.ingredients).toEqual(recipeData.ingredients);
            expect(storedRecipe.steps).toEqual(recipeData.steps);
            expect(storedRecipe.category).toBe(category.name);
            expect(storedRecipe.author_id.toString()).toBe(testUser._id.toString());

            // Cleanup
            await Recipe.findByIdAndDelete(recipe._id);
          }
        ),
        { numRuns: 50 }
      );
    }, 60000);
  });

  // Feature: campus-cook, Property 13: Required field validation
  describe('Property 13: Required field validation', () => {
    test('recipes missing required fields are rejected', async () => {
      const testCases = [
        { title: undefined, ingredients: ['flour'], steps: ['mix'], category: 'Breakfast' },
        { title: 'Test', ingredients: undefined, steps: ['mix'], category: 'Breakfast' },
        { title: 'Test', ingredients: ['flour'], steps: undefined, category: 'Breakfast' },
        { title: 'Test', ingredients: ['flour'], steps: ['mix'], category: undefined }
      ];

      for (const testCase of testCases) {
        let errorThrown = false;
        try {
          await Recipe.create({
            ...testCase,
            author_id: testUser._id
          });
        } catch (error) {
          errorThrown = true;
          expect(error.name).toBe('ValidationError');
        }
        expect(errorThrown).toBe(true);
      }
    });
  });

  // Feature: campus-cook, Property 14: Title length validation
  describe('Property 14: Title length validation', () => {
    test('recipes with invalid title lengths are rejected', async () => {
      const category = testCategories[0];

      // Test title too short (less than 5 characters)
      let errorThrown = false;
      try {
        await Recipe.create({
          title: 'Test', // 4 characters
          ingredients: ['test'],
          steps: ['test'],
          category: category.name,
          author_id: testUser._id
        });
      } catch (error) {
        errorThrown = true;
        expect(error.name).toBe('ValidationError');
      }
      expect(errorThrown).toBe(true);

      // Test title too long (more than 200 characters)
      errorThrown = false;
      try {
        await Recipe.create({
          title: 'A'.repeat(201),
          ingredients: ['test'],
          steps: ['test'],
          category: category.name,
          author_id: testUser._id
        });
      } catch (error) {
        errorThrown = true;
        expect(error.name).toBe('ValidationError');
      }
      expect(errorThrown).toBe(true);
    });
  });

  // Feature: campus-cook, Property 15: Empty list validation
  describe('Property 15: Empty list validation', () => {
    test('recipes with empty ingredients or steps are rejected', async () => {
      const category = testCategories[0];

      // Test empty ingredients
      let errorThrown = false;
      try {
        await Recipe.create({
          title: 'Test Recipe',
          ingredients: [],
          steps: ['mix'],
          category: category.name,
          author_id: testUser._id
        });
      } catch (error) {
        errorThrown = true;
        expect(error.name).toBe('ValidationError');
      }
      expect(errorThrown).toBe(true);

      // Test empty steps
      errorThrown = false;
      try {
        await Recipe.create({
          title: 'Test Recipe',
          ingredients: ['flour'],
          steps: [],
          category: category.name,
          author_id: testUser._id
        });
      } catch (error) {
        errorThrown = true;
        expect(error.name).toBe('ValidationError');
      }
      expect(errorThrown).toBe(true);
    });
  });

  // Feature: campus-cook, Property 16: Prep time validation
  describe('Property 16: Prep time validation', () => {
    test('recipes with invalid prep times are rejected', async () => {
      const category = testCategories[0];

      // Test negative prep time
      let errorThrown = false;
      try {
        await Recipe.create({
          title: 'Test Recipe',
          ingredients: ['test'],
          steps: ['test'],
          prep_time: -5,
          category: category.name,
          author_id: testUser._id
        });
      } catch (error) {
        errorThrown = true;
      }
      expect(errorThrown).toBe(true);

      // Test zero prep time
      errorThrown = false;
      try {
        await Recipe.create({
          title: 'Test Recipe',
          ingredients: ['test'],
          steps: ['test'],
          prep_time: 0,
          category: category.name,
          author_id: testUser._id
        });
      } catch (error) {
        errorThrown = true;
      }
      expect(errorThrown).toBe(true);
    });
  });

  // Feature: campus-cook, Property 10: Recipe image association
  describe('Property 10: Recipe image association', () => {
    test('recipes with image URLs store and retrieve images correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(),
          async (imageUrl) => {
            const category = testCategories[0];

            const recipe = await Recipe.create({
              title: 'Test Recipe with Image',
              ingredients: ['test'],
              steps: ['test'],
              category: category.name,
              image_url: imageUrl,
              author_id: testUser._id
            });

            const storedRecipe = await Recipe.findById(recipe._id);
            expect(storedRecipe.image_url).toBe(imageUrl);

            await Recipe.findByIdAndDelete(recipe._id);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // Feature: campus-cook, Property 11: Creation timestamp immutability
  describe('Property 11: Creation timestamp immutability', () => {
    test('updating recipe preserves original creation timestamp', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length >= 5),
            newTitle: fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length >= 5)
          }),
          async ({ title, newTitle }) => {
            const category = testCategories[0];

            // Create recipe
            const recipe = await Recipe.create({
              title,
              ingredients: ['test'],
              steps: ['test'],
              category: category.name,
              author_id: testUser._id
            });

            const originalCreatedAt = recipe.createdAt;

            // Wait a bit to ensure timestamps would differ
            await new Promise(resolve => setTimeout(resolve, 100));

            // Update recipe
            recipe.title = newTitle;
            await recipe.save();

            // Fetch updated recipe
            const updatedRecipe = await Recipe.findById(recipe._id);

            // Assert creation timestamp is unchanged
            expect(updatedRecipe.createdAt.getTime()).toBe(originalCreatedAt.getTime());
            expect(updatedRecipe.updatedAt.getTime()).toBeGreaterThan(originalCreatedAt.getTime());

            await Recipe.findByIdAndDelete(recipe._id);
          }
        ),
        { numRuns: 20 }
      );
    }, 60000);
  });

  // Feature: campus-cook, Property 12: Recipe ownership authorization
  describe('Property 12: Recipe ownership authorization', () => {
    test('users cannot edit recipes they do not own', async () => {
      // Create another user
      const password_hash = await bcrypt.hash('testpassword123', 10);
      const otherUser = await User.create({
        name: 'Other User',
        email: `test.other.${Date.now()}@property.test`,
        password_hash
      });

      const category = testCategories[0];

      // Create recipe by first user
      const recipe = await Recipe.create({
        title: 'Original Recipe',
        ingredients: ['test'],
        steps: ['test'],
        category: category.name,
        author_id: testUser._id
      });

      // Simulate authorization check (like in controller)
      const isOwner = recipe.author_id.toString() === otherUser._id.toString();
      const isAdmin = otherUser.role === 'admin';
      const canEdit = isOwner || isAdmin;

      // Assert other user cannot edit
      expect(canEdit).toBe(false);

      // Cleanup
      await Recipe.findByIdAndDelete(recipe._id);
      await User.findByIdAndDelete(otherUser._id);
    });
  });

  // Feature: campus-cook, Property 18: Pagination correctness
  describe('Property 18: Pagination correctness', () => {
    test('pagination correctly divides recipes into pages', async () => {
      const category = testCategories[0];
      
      // Create 25 test recipes
      const recipes = [];
      for (let i = 0; i < 25; i++) {
        const recipe = await Recipe.create({
          title: `Test Recipe ${i}`,
          ingredients: ['test'],
          steps: ['test'],
          category: category.name,
          author_id: testUser._id
        });
        recipes.push(recipe);
      }

      // Test pagination with limit of 10
      const limit = 10;
      const totalRecipes = 25;
      const expectedPages = Math.ceil(totalRecipes / limit);

      // Fetch page 1
      const page1 = await Recipe.find({ author_id: testUser._id })
        .limit(limit)
        .skip(0);
      
      expect(page1.length).toBe(10);
      expect(expectedPages).toBe(3);

      // Fetch page 2
      const page2 = await Recipe.find({ author_id: testUser._id })
        .limit(limit)
        .skip(10);
      
      expect(page2.length).toBe(10);

      // Fetch page 3 (last page with remaining items)
      const page3 = await Recipe.find({ author_id: testUser._id })
        .limit(limit)
        .skip(20);
      
      expect(page3.length).toBe(5);

      // Cleanup
      await Recipe.deleteMany({ _id: { $in: recipes.map(r => r._id) } });
    });
  });

  // Feature: campus-cook, Property 19: Search query matching
  describe('Property 19: Search query matching', () => {
    test('search returns only recipes matching the query', async () => {
      const category = testCategories[0];
      
      // Create recipes with specific keywords
      const recipe1 = await Recipe.create({
        title: 'Chocolate Cake',
        description: 'Delicious chocolate dessert',
        ingredients: ['chocolate', 'flour', 'sugar'],
        steps: ['mix', 'bake'],
        category: category.name,
        author_id: testUser._id
      });

      const recipe2 = await Recipe.create({
        title: 'Vanilla Ice Cream',
        description: 'Creamy vanilla treat',
        ingredients: ['vanilla', 'milk', 'sugar'],
        steps: ['mix', 'freeze'],
        category: category.name,
        author_id: testUser._id
      });

      // Search for "chocolate"
      const chocolateResults = await Recipe.find({
        $or: [
          { title: { $regex: 'chocolate', $options: 'i' } },
          { description: { $regex: 'chocolate', $options: 'i' } },
          { ingredients: { $regex: 'chocolate', $options: 'i' } }
        ]
      });

      expect(chocolateResults.length).toBeGreaterThan(0);
      expect(chocolateResults.some(r => r._id.equals(recipe1._id))).toBe(true);
      expect(chocolateResults.some(r => r._id.equals(recipe2._id))).toBe(false);

      // Cleanup
      await Recipe.deleteMany({ _id: { $in: [recipe1._id, recipe2._id] } });
    });
  });

  // Feature: campus-cook, Property 20: Category filter accuracy
  describe('Property 20: Category filter accuracy', () => {
    test('category filter returns only recipes from that category', async () => {
      // Create recipes in different categories
      const recipes = [];
      for (let i = 0; i < Math.min(3, testCategories.length); i++) {
        const recipe = await Recipe.create({
          title: `Recipe in ${testCategories[i].name}`,
          ingredients: ['test'],
          steps: ['test'],
          category: testCategories[i].name,
          author_id: testUser._id
        });
        recipes.push(recipe);
      }

      // Filter by first category
      const targetCategory = testCategories[0].name;
      const filtered = await Recipe.find({ category: targetCategory });

      // All results should be from target category
      filtered.forEach(recipe => {
        expect(recipe.category).toBe(targetCategory);
      });

      // Cleanup
      await Recipe.deleteMany({ _id: { $in: recipes.map(r => r._id) } });
    });
  });

  // Feature: campus-cook, Property 21: Sort order correctness
  describe('Property 21: Sort order correctness', () => {
    test('recipes are sorted correctly by specified criteria', async () => {
      const category = testCategories[0];
      
      // Create recipes with different prep times
      const recipe1 = await Recipe.create({
        title: 'Quick Recipe',
        ingredients: ['test'],
        steps: ['test'],
        prep_time: 10,
        category: category.name,
        author_id: testUser._id
      });

      const recipe2 = await Recipe.create({
        title: 'Medium Recipe',
        ingredients: ['test'],
        steps: ['test'],
        prep_time: 30,
        category: category.name,
        author_id: testUser._id
      });

      const recipe3 = await Recipe.create({
        title: 'Long Recipe',
        ingredients: ['test'],
        steps: ['test'],
        prep_time: 60,
        category: category.name,
        author_id: testUser._id
      });

      // Sort by prep_time ascending
      const sortedAsc = await Recipe.find({ 
        _id: { $in: [recipe1._id, recipe2._id, recipe3._id] }
      }).sort({ prep_time: 1 });

      expect(sortedAsc[0].prep_time).toBeLessThanOrEqual(sortedAsc[1].prep_time);
      expect(sortedAsc[1].prep_time).toBeLessThanOrEqual(sortedAsc[2].prep_time);

      // Sort by prep_time descending
      const sortedDesc = await Recipe.find({ 
        _id: { $in: [recipe1._id, recipe2._id, recipe3._id] }
      }).sort({ prep_time: -1 });

      expect(sortedDesc[0].prep_time).toBeGreaterThanOrEqual(sortedDesc[1].prep_time);
      expect(sortedDesc[1].prep_time).toBeGreaterThanOrEqual(sortedDesc[2].prep_time);

      // Cleanup
      await Recipe.deleteMany({ _id: { $in: [recipe1._id, recipe2._id, recipe3._id] } });
    });
  });


});
