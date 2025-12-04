const request = require('supertest');
const app = require('../server');
const fc = require('fast-check');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Rating = require('../models/Rating');
const jwt = require('jsonwebtoken');
const { connectDB, closeDB } = require('../config/database');

describe('Rating Property-Based Tests', () => {
  let authToken;
  let testUser;

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

    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
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
   * Feature: campus-cook, Property 28: Rating storage and association
   * Validates: Requirements 5.1, 5.2
   */
  test('Property 28: For any valid rating, it should be stored and associated with the recipe', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          ingredients: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          steps: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        fc.integer({ min: 1, max: 5 }),
        async (recipeData, rating) => {
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          const response = await request(app)
            .post(`/api/ratings/${recipe._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ rating });

          expect([200, 201]).toContain(response.status);

          const storedRating = await Rating.findOne({
            user_id: testUser._id,
            recipe_id: recipe._id
          });

          expect(storedRating).not.toBeNull();
          expect(storedRating.rating).toBe(rating);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 29: Review text persistence
   * Validates: Requirements 5.2
   */
  test('Property 29: For any rating with review text, the review should be persisted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          ingredients: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          steps: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        fc.integer({ min: 1, max: 5 }),
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (recipeData, rating, review) => {
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          await request(app)
            .post(`/api/ratings/${recipe._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ rating, review });

          const storedRating = await Rating.findOne({
            user_id: testUser._id,
            recipe_id: recipe._id
          });

          expect(storedRating.review).toBe(review);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 30: Average rating calculation
   * Validates: Requirements 5.3
   */
  test('Property 30: For any set of ratings, the average should be calculated correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          ingredients: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          steps: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 10 }),
        async (recipeData, ratings) => {
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          // Create multiple users and ratings
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
            .get(`/api/ratings/recipe/${recipe._id}`);

          expect(response.status).toBe(200);

          const expectedAvg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          const roundedExpected = Math.round(expectedAvg * 10) / 10;

          expect(response.body.averageRating).toBe(roundedExpected);
          expect(response.body.totalRatings).toBe(ratings.length);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 31: Rating update idempotence
   * Validates: Requirements 5.4
   */
  test('Property 31: For any user rating, updating it multiple times should result in the latest value', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          ingredients: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          steps: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 2, maxLength: 5 }),
        async (recipeData, ratingSequence) => {
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          // Submit ratings in sequence
          for (const rating of ratingSequence) {
            await request(app)
              .post(`/api/ratings/${recipe._id}`)
              .set('Authorization', `Bearer ${authToken}`)
              .send({ rating });
          }

          // Should only have one rating
          const count = await Rating.countDocuments({
            user_id: testUser._id,
            recipe_id: recipe._id
          });

          expect(count).toBe(1);

          // Should have the last rating value
          const storedRating = await Rating.findOne({
            user_id: testUser._id,
            recipe_id: recipe._id
          });

          expect(storedRating.rating).toBe(ratingSequence[ratingSequence.length - 1]);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: campus-cook, Property 32: Review display completeness
   * Validates: Requirements 5.5
   */
  test('Property 32: For any recipe ratings, all reviews should display with user names and timestamps', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 5, maxLength: 200 }),
          ingredients: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          steps: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          category: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack', 'dessert')
        }),
        fc.array(
          fc.record({
            rating: fc.integer({ min: 1, max: 5 }),
            review: fc.string({ minLength: 1, maxLength: 100 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (recipeData, reviews) => {
          const recipe = await Recipe.create({
            ...recipeData,
            author_id: testUser._id
          });

          // Create ratings with reviews
          for (let i = 0; i < reviews.length; i++) {
            const user = await User.create({
              name: `Reviewer ${i}`,
              email: `reviewer${i}@test.com`,
              password: 'password'
            });

            await Rating.create({
              user_id: user._id,
              recipe_id: recipe._id,
              rating: reviews[i].rating,
              review: reviews[i].review
            });
          }

          const response = await request(app)
            .get(`/api/ratings/recipe/${recipe._id}`);

          expect(response.status).toBe(200);
          expect(response.body.ratings).toHaveLength(reviews.length);

          // Check each rating has required fields
          response.body.ratings.forEach(r => {
            expect(r.user).toBeDefined();
            expect(r.user.name).toBeDefined();
            expect(r.rating).toBeDefined();
            expect(r.review).toBeDefined();
            expect(r.createdAt).toBeDefined();
          });
        }
      ),
      { numRuns: 20 }
    );
  });
});
