const request = require('supertest');
const app = require('../server');
const fc = require('fast-check');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Rating = require('../models/Rating');
const jwt = require('jsonwebtoken');
const { connectDB, closeDB } = require('../config/database');

describe('User Portfolio and Admin Property-Based Tests', () => {
  let authToken, adminToken;
  let testUser, adminUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Rating.deleteMany({});

    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: 'user'
    });

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashedpassword123',
      role: 'admin'
    });

    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Rating.deleteMany({});
  });

  /**
   * Feature: campus-cook, Property 23: User recipe portfolio completeness
   * Validates: Requirements 8.1
   */
  test('Property 23: For any user, their portfolio should contain all recipes they created', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 200 }),
            ingredients: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
            steps: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
            category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (recipesData) => {
          const createdIds = [];
          for (const recipeData of recipesData) {
            const recipe = await Recipe.create({
              ...recipeData,
              author_id: testUser._id
            });
            createdIds.push(recipe._id.toString());
          }

          const response = await request(app)
            .get(`/api/recipes/user/${testUser._id}`);

          expect(response.status).toBe(200);
          expect(response.body.recipes).toHaveLength(recipesData.length);

          const returnedIds = response.body.recipes.map(r => r.id.toString());
          createdIds.forEach(id => {
            expect(returnedIds).toContain(id);
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 24: Recipe statistics accuracy
   * Validates: Requirements 8.2
   */
  test('Property 24: For any recipe in user portfolio, statistics should be accurate', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          ingredients: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          steps: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 0, maxLength: 5 }),
        async (recipeData, ratings) => {
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          // Add ratings
          for (let i = 0; i < ratings.length; i++) {
            const user = await User.create({
              name: `User ${i}`,
              email: `user${i}@test.com`,
              password: 'password'
            });

            await Rating.create({
              user_id: user._id,
              recipe_id: recipe._id,
              rating: ratings[i]
            });
          }

          const response = await request(app)
            .get(`/api/recipes/user/${testUser._id}`);

          expect(response.status).toBe(200);
          const recipeInPortfolio = response.body.recipes.find(r => r.id.toString() === recipe._id.toString());

          expect(recipeInPortfolio.ratingCount).toBe(ratings.length);

          if (ratings.length > 0) {
            const expectedAvg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            expect(recipeInPortfolio.averageRating).toBe(Math.round(expectedAvg * 10) / 10);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 33: Admin access privileges
   * Validates: Requirements 6.1
   */
  test('Property 33: For any admin user, they should have access to admin endpoints', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          const response = await request(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${adminToken}`);

          expect(response.status).toBe(200);
          expect(response.body.statistics).toBeDefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: campus-cook, Property 35: Admin dashboard data accuracy
   * Validates: Requirements 6.3
   */
  test('Property 35: For any system state, admin dashboard should show accurate statistics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 5 }),
        async (numUsers, numRecipes) => {
          // Create users
          for (let i = 0; i < numUsers; i++) {
            await User.create({
              name: `User ${i}`,
              email: `user${i}@test.com`,
              password: 'password'
            });
          }

          // Create recipes
          for (let i = 0; i < numRecipes; i++) {
            await Recipe.create({
              title: `Recipe ${i}`,
              ingredients: ['ingredient'],
              steps: ['step'],
              category: 'breakfast',
              author_id: testUser._id
            });
          }

          const response = await request(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${adminToken}`);

          expect(response.status).toBe(200);
          expect(response.body.statistics.totalUsers).toBeGreaterThanOrEqual(numUsers);
          expect(response.body.statistics.totalRecipes).toBe(numRecipes);
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * Feature: campus-cook, Property 39: Immediate recipe persistence
   * Validates: Requirements 13.1
   */
  test('Property 39: For any created recipe, it should be immediately retrievable', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          ingredients: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          steps: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        async (recipeData) => {
          const createResponse = await request(app)
            .post('/api/recipes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(recipeData);

          expect(createResponse.status).toBe(201);
          const recipeId = createResponse.body.recipe.id;

          // Immediately try to retrieve
          const getResponse = await request(app)
            .get(`/api/recipes/${recipeId}`);

          expect(getResponse.status).toBe(200);
          expect(getResponse.body.recipe.title).toBe(recipeData.title);
        }
      ),
      { numRuns: 20 }
    );
  });
});
