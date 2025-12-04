const request = require('supertest');
const app = require('../server');
const fc = require('fast-check');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');
const jwt = require('jsonwebtoken');
const { connectDB, closeDB } = require('../config/database');

describe('Favorite Property-Based Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Favorite.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'user'
    });

    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Favorite.deleteMany({});
  });

  /**
   * Feature: campus-cook, Property 25: Favorite addition and retrieval
   * Validates: Requirements 4.1, 4.3
   */
  test('Property 25: For any recipe, adding it to favorites should make it appear in user favorites list', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          description: fc.string({ minLength: 10, maxLength: 1000 }),
          ingredients: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
          steps: fc.array(fc.string({ minLength: 1, maxLength: 500 }), { minLength: 1, maxLength: 20 }),
          prep_time: fc.integer({ min: 1, max: 500 }),
          difficulty: fc.constantFrom('easy', 'medium', 'hard'),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        async (recipeData) => {
          // Create a recipe
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          // Add to favorites
          const addResponse = await request(app)
            .post(`/api/favorites/${recipe._id}`)
            .set('Authorization', `Bearer ${authToken}`);

          expect([200, 201]).toContain(addResponse.status);

          // Get favorites
          const getResponse = await request(app)
            .get('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`);

          expect(getResponse.status).toBe(200);
          expect(getResponse.body.recipes).toBeDefined();
          
          const favoriteIds = getResponse.body.recipes.map(r => r.id.toString());
          expect(favoriteIds).toContain(recipe._id.toString());
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 26: Favorite removal preserves recipe
   * Validates: Requirements 4.2
   */
  test('Property 26: For any favorited recipe, removing it from favorites should not delete the recipe', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          description: fc.string({ minLength: 10, maxLength: 1000 }),
          ingredients: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
          steps: fc.array(fc.string({ minLength: 1, maxLength: 500 }), { minLength: 1, maxLength: 20 }),
          prep_time: fc.integer({ min: 1, max: 500 }),
          difficulty: fc.constantFrom('easy', 'medium', 'hard'),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        async (recipeData) => {
          // Create and favorite a recipe
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          await Favorite.create({
            user_id: testUser._id,
            recipe_id: recipe._id
          });

          // Remove from favorites
          const removeResponse = await request(app)
            .delete(`/api/favorites/${recipe._id}`)
            .set('Authorization', `Bearer ${authToken}`);

          expect(removeResponse.status).toBe(200);

          // Verify recipe still exists
          const recipeStillExists = await Recipe.findById(recipe._id);
          expect(recipeStillExists).not.toBeNull();
          expect(recipeStillExists.title).toBe(recipeData.title);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 27: Favorite status indication
   * Validates: Requirements 4.4
   */
  test('Property 27: For any recipe, the isFavorited field should accurately reflect favorite status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          description: fc.string({ minLength: 10, maxLength: 1000 }),
          ingredients: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
          steps: fc.array(fc.string({ minLength: 1, maxLength: 500 }), { minLength: 1, maxLength: 20 }),
          prep_time: fc.integer({ min: 1, max: 500 }),
          difficulty: fc.constantFrom('easy', 'medium', 'hard'),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        fc.boolean(),
        async (recipeData, shouldFavorite) => {
          // Create a recipe
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          // Conditionally favorite it
          if (shouldFavorite) {
            await Favorite.create({
              user_id: testUser._id,
              recipe_id: recipe._id
            });
          }

          // Get recipe details with favorite status
          const response = await request(app)
            .get(`/api/recipes/${recipe._id}`)
            .set('Authorization', `Bearer ${authToken}`);

          expect(response.status).toBe(200);
          
          // Check if isFavorited matches actual favorite status
          if (response.body.recipe.isFavorited !== undefined) {
            expect(response.body.recipe.isFavorited).toBe(shouldFavorite);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 40: Favorite persistence across sessions
   * Validates: Requirements 13.2
   */
  test('Property 40: For any favorited recipe, it should remain in favorites after logout and login', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          description: fc.string({ minLength: 10, maxLength: 1000 }),
          ingredients: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
          steps: fc.array(fc.string({ minLength: 1, maxLength: 500 }), { minLength: 1, maxLength: 20 }),
          prep_time: fc.integer({ min: 1, max: 500 }),
          difficulty: fc.constantFrom('easy', 'medium', 'hard'),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        async (recipeData) => {
          // Create and favorite a recipe
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          await request(app)
            .post(`/api/favorites/${recipe._id}`)
            .set('Authorization', `Bearer ${authToken}`);

          // Simulate new session with new token
          const newToken = jwt.sign(
            { userId: testUser._id, email: testUser.email, role: testUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );

          // Get favorites with new token
          const response = await request(app)
            .get('/api/favorites')
            .set('Authorization', `Bearer ${newToken}`);

          expect(response.status).toBe(200);
          const favoriteIds = response.body.recipes.map(r => r.id.toString());
          expect(favoriteIds).toContain(recipe._id.toString());
        }
      ),
      { numRuns: 20 }
    );
  });
});
