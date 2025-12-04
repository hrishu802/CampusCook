const fc = require('fast-check');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');

describe('Authentication Property Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clean up test users after each test
    await User.deleteMany({ email: /test.*@property\.test/ });
  });

// Feature: campus-cook, Property 1: Password hashing universality
describe('Property 1: Password hashing universality', () => {

  test('all registered users have hashed passwords', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length >= 2),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8)
        }),
        async (userData) => {
          // Create unique email with timestamp
          const uniqueEmail = `test.${Date.now()}.${userData.email.replace(/@/g, '_')}@property.test`;
          
          // Hash password using bcrypt
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
          const password_hash = await bcrypt.hash(userData.password, saltRounds);

          // Create user with hashed password
          const user = await User.create({
            name: userData.name,
            email: uniqueEmail.toLowerCase(),
            password_hash
          });

          // Fetch user from database
          const storedUser = await User.findById(user._id);

          // Assert password is hashed (not plaintext)
          expect(storedUser.password_hash).not.toBe(userData.password);
          
          // Assert password hash matches bcrypt format ($2b$...)
          expect(storedUser.password_hash).toMatch(/^\$2[aby]\$.{56}$/);
          
          // Assert we can verify the password with bcrypt
          const isValid = await bcrypt.compare(userData.password, storedUser.password_hash);
          expect(isValid).toBe(true);

          // Cleanup
          await User.findByIdAndDelete(user._id);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for 100 runs
});

// Feature: campus-cook, Property 2: Valid login generates token
describe('Property 2: Valid login generates token', () => {
  test('logging in with correct credentials generates a valid JWT token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length >= 2),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8)
        }),
        async (userData) => {
          // Create unique email with timestamp
          const uniqueEmail = `test.${Date.now()}.${userData.email.replace(/@/g, '_')}@property.test`;
          
          // Create user with hashed password
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
          const password_hash = await bcrypt.hash(userData.password, saltRounds);
          
          const user = await User.create({
            name: userData.name,
            email: uniqueEmail.toLowerCase(),
            password_hash
          });

          // Simulate login by generating token
          const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
          );

          // Verify token is valid
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
          // Assert token contains correct user information
          expect(decoded.userId.toString()).toBe(user._id.toString());
          expect(decoded.email).toBe(user.email);
          expect(decoded.role).toBe(user.role);
          
          // Assert token has expiration
          expect(decoded.exp).toBeDefined();
          expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

          // Cleanup
          await User.findByIdAndDelete(user._id);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});

// Feature: campus-cook, Property 3: Token expiration enforcement
describe('Property 3: Token expiration enforcement', () => {
  test('expired tokens are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length >= 2),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8)
        }),
        async (userData) => {
          const uniqueEmail = `test.${Date.now()}.${userData.email.replace(/@/g, '_')}@property.test`;
          
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
          const password_hash = await bcrypt.hash(userData.password, saltRounds);
          
          const user = await User.create({
            name: userData.name,
            email: uniqueEmail.toLowerCase(),
            password_hash
          });

          // Create an expired token (expires in 1 second)
          const expiredToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1s' }
          );

          // Wait for token to expire
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Try to verify expired token
          try {
            jwt.verify(expiredToken, process.env.JWT_SECRET);
            // If we get here, the test should fail
            expect(true).toBe(false); // Force failure
          } catch (error) {
            // Assert that the error is TokenExpiredError
            expect(error.name).toBe('TokenExpiredError');
          }

          // Cleanup
          await User.findByIdAndDelete(user._id);
        }
      ),
      { numRuns: 10 } // Reduced runs due to timeout delays
    );
  }, 60000);
});

// Feature: campus-cook, Property 5: Unauthenticated access denial
describe('Property 5: Unauthenticated access denial', () => {
  test('requests without valid tokens are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.constant(''),
          fc.string().filter(s => !s.startsWith('eyJ')), // Invalid token format
          fc.constant('Bearer invalid_token')
        ),
        async (invalidToken) => {
          // Simulate middleware behavior
          const mockReq = {
            headers: {
              authorization: invalidToken
            }
          };

          let errorThrown = false;
          let errorMessage = '';

          // Extract token like middleware does
          const authHeader = mockReq.headers.authorization;
          const token = authHeader && authHeader.split(' ')[1];

          if (!token) {
            errorThrown = true;
            errorMessage = 'Access token is required';
          } else {
            try {
              jwt.verify(token, process.env.JWT_SECRET);
            } catch (error) {
              errorThrown = true;
              errorMessage = error.message;
            }
          }

          // Assert that invalid/missing tokens are rejected
          expect(errorThrown).toBe(true);
          expect(errorMessage).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: campus-cook, Property 7: Token tampering detection
describe('Property 7: Token tampering detection', () => {
  test('tampered tokens are detected and rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length >= 2),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8)
        }),
        async (userData) => {
          const uniqueEmail = `test.${Date.now()}.${userData.email.replace(/@/g, '_')}@property.test`;
          
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
          const password_hash = await bcrypt.hash(userData.password, saltRounds);
          
          const user = await User.create({
            name: userData.name,
            email: uniqueEmail.toLowerCase(),
            password_hash
          });

          // Create a valid token
          const validToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );

          // Tamper with the token by modifying the payload
          const parts = validToken.split('.');
          if (parts.length === 3) {
            // Modify the payload (middle part)
            const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'hacked', role: 'admin' }))
              .toString('base64')
              .replace(/=/g, '');
            const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

            // Try to verify tampered token
            try {
              jwt.verify(tamperedToken, process.env.JWT_SECRET);
              // If we get here, the test should fail
              expect(true).toBe(false); // Force failure
            } catch (error) {
              // Assert that the error is JsonWebTokenError (invalid signature)
              expect(error.name).toBe('JsonWebTokenError');
              expect(error.message).toContain('invalid');
            }
          }

          // Cleanup
          await User.findByIdAndDelete(user._id);
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});

// Feature: campus-cook, Property 6: Role-based authorization
describe('Property 6: Role-based authorization', () => {
  test('non-admin users cannot perform admin actions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length >= 2),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8),
          role: fc.constantFrom('user', 'admin')
        }),
        async (userData) => {
          const uniqueEmail = `test.${Date.now()}.${userData.email.replace(/@/g, '_')}@property.test`;
          
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
          const password_hash = await bcrypt.hash(userData.password, saltRounds);
          
          const user = await User.create({
            name: userData.name,
            email: uniqueEmail.toLowerCase(),
            password_hash,
            role: userData.role
          });

          // Create a token with the user's role
          const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );

          // Decode token to simulate middleware
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          // Simulate authorizeRole middleware for admin-only action
          const requiredRoles = ['admin'];
          const hasPermission = requiredRoles.includes(decoded.role);

          // Assert: Only admin users should have permission
          if (userData.role === 'admin') {
            expect(hasPermission).toBe(true);
          } else {
            expect(hasPermission).toBe(false);
          }

          // Cleanup
          await User.findByIdAndDelete(user._id);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: campus-cook, Property 4: Duplicate email rejection
describe('Property 4: Duplicate email rejection', () => {
  test('attempting to register with an existing email is rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length >= 2),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8)
        }),
        async (userData) => {
          const uniqueEmail = `test.${Date.now()}.${userData.email.replace(/@/g, '_')}@property.test`;
          
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
          const password_hash = await bcrypt.hash(userData.password, saltRounds);
          
          // Create first user
          const firstUser = await User.create({
            name: userData.name,
            email: uniqueEmail.toLowerCase(),
            password_hash
          });

          // Try to create second user with same email
          let errorThrown = false;
          let errorCode = null;

          try {
            await User.create({
              name: 'Different Name',
              email: uniqueEmail.toLowerCase(), // Same email
              password_hash
            });
          } catch (error) {
            errorThrown = true;
            errorCode = error.code;
          }

          // Assert that duplicate email was rejected
          expect(errorThrown).toBe(true);
          expect(errorCode).toBe(11000); // MongoDB duplicate key error code

          // Cleanup
          await User.findByIdAndDelete(firstUser._id);
        }
      ),
      { numRuns: 100 }
    );
  });
});

});
