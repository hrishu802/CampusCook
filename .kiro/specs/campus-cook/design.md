# Design Document

## Overview

CampusCook is a full-stack web application built using the MERN stack (MySQL variant) that provides college students with a centralized platform for recipe management and sharing. The system follows a three-tier architecture with a React frontend, Express.js REST API backend, and MySQL database. The application emphasizes security through JWT-based authentication, user experience through responsive design, and data integrity through proper validation and database constraints.

The system serves two primary user roles: regular users who can create, browse, and manage their own recipes, and administrators who have elevated privileges to moderate content across the platform. The architecture is designed to be scalable, maintainable, and deployable on modern cloud platforms.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React SPA (Vercel/Netlify)                            │ │
│  │  - React Router for navigation                         │ │
│  │  - Axios for API communication                         │ │
│  │  - TailwindCSS for styling                            │ │
│  │  - JWT token management                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express.js REST API (Render/Railway)                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Auth         │  │ Recipe       │  │ Rating      │ │ │
│  │  │ Middleware   │  │ Controllers  │  │ Controllers │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Validation   │  │ Business     │  │ Error       │ │ │
│  │  │ Layer        │  │ Logic        │  │ Handling    │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MySQL Database (PlanetScale/Local)                    │ │
│  │  ┌──────┐  ┌────────┐  ┌───────────┐  ┌──────────┐  │ │
│  │  │Users │  │Recipes │  │Categories │  │Favorites │  │ │
│  │  └──────┘  └────────┘  └───────────┘  └──────────┘  │ │
│  │  ┌──────────┐                                         │ │
│  │  │ Ratings  │                                         │ │
│  │  └──────────┘                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Rationale

**Frontend (React.js):**
- Component-based architecture enables reusable UI elements
- Virtual DOM provides efficient rendering for dynamic recipe lists
- Rich ecosystem with routing (React Router) and HTTP client (Axios)
- Easy deployment to static hosting platforms

**Backend (Node.js + Express.js):**
- JavaScript across full stack reduces context switching
- Express.js provides lightweight, flexible REST API framework
- Middleware architecture supports authentication, validation, and error handling
- Non-blocking I/O suitable for handling multiple concurrent requests

**Database (MySQL):**
- Relational model fits structured recipe data with clear relationships
- ACID compliance ensures data integrity for user accounts and recipes
- Wide hosting support and mature ecosystem
- SQL provides powerful querying for search and filtering operations

**Authentication (JWT + bcrypt):**
- Stateless authentication scales horizontally without session storage
- bcrypt provides industry-standard password hashing with salt
- JWT tokens enable secure API access without database lookups per request

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components
- **LoginForm**: Handles user login with email/password validation
- **SignupForm**: Manages new user registration with password confirmation
- **AuthContext**: React Context providing authentication state and methods globally

#### 2. Recipe Components
- **RecipeList**: Displays paginated grid of recipe cards with filtering/sorting
- **RecipeCard**: Shows recipe preview with image, title, rating, and quick actions
- **RecipeDetail**: Full recipe view with ingredients, steps, ratings, and reviews
- **RecipeForm**: Form for creating/editing recipes with image upload
- **RecipeSearch**: Search bar with autocomplete and filter controls

#### 3. User Components
- **UserProfile**: Displays user information and statistics
- **MyRecipes**: Lists all recipes created by the current user
- **FavoritesList**: Shows user's saved favorite recipes

#### 4. Admin Components
- **AdminDashboard**: Overview of system statistics and pending approvals
- **RecipeModeration**: Interface for approving/rejecting/editing recipes

#### 5. Shared Components
- **Navbar**: Navigation bar with authentication-aware menu
- **Pagination**: Reusable pagination controls
- **RatingStars**: Star rating display and input component
- **ImageUpload**: Drag-and-drop image upload with preview
- **LoadingSpinner**: Loading state indicator
- **ErrorBoundary**: Error handling wrapper component

### Backend API Structure

#### 1. Authentication Module
```javascript
// Routes
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

// Middleware
authenticateToken(req, res, next)
authorizeRole(roles)(req, res, next)
```

#### 2. Recipe Module
```javascript
// Routes
GET    /api/recipes          // List with pagination, search, filter
GET    /api/recipes/:id      // Single recipe details
POST   /api/recipes          // Create new recipe
PUT    /api/recipes/:id      // Update recipe
DELETE /api/recipes/:id      // Delete recipe
GET    /api/recipes/user/:userId  // User's recipes

// Controllers
recipeController.getAll()
recipeController.getById()
recipeController.create()
recipeController.update()
recipeController.delete()
```

#### 3. Category Module
```javascript
// Routes
GET /api/categories          // List all categories
GET /api/categories/:id/recipes  // Recipes by category

// Controllers
categoryController.getAll()
categoryController.getRecipes()
```

#### 4. Favorites Module
```javascript
// Routes
GET    /api/favorites        // User's favorites
POST   /api/favorites/:recipeId  // Add to favorites
DELETE /api/favorites/:recipeId  // Remove from favorites

// Controllers
favoriteController.getUserFavorites()
favoriteController.addFavorite()
favoriteController.removeFavorite()
```

#### 5. Rating Module
```javascript
// Routes
GET  /api/ratings/recipe/:recipeId  // Get recipe ratings
POST /api/ratings/:recipeId         // Add/update rating

// Controllers
ratingController.getRecipeRatings()
ratingController.addOrUpdateRating()
```

### API Request/Response Formats

#### Authentication
```json
// POST /api/auth/signup
Request: {
  "name": "string",
  "email": "string",
  "password": "string"
}
Response: {
  "token": "jwt_token",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "user|admin"
  }
}

// POST /api/auth/login
Request: {
  "email": "string",
  "password": "string"
}
Response: {
  "token": "jwt_token",
  "user": { /* same as signup */ }
}
```

#### Recipes
```json
// GET /api/recipes?page=1&limit=12&search=pasta&category=vegetarian&sort=rating
Response: {
  "recipes": [
    {
      "id": "number",
      "title": "string",
      "description": "string",
      "ingredients": "string[]",
      "steps": "string[]",
      "prepTime": "number",
      "difficulty": "easy|medium|hard",
      "category": "string",
      "imageUrl": "string",
      "authorId": "number",
      "authorName": "string",
      "averageRating": "number",
      "ratingCount": "number",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "currentPage": "number",
    "totalPages": "number",
    "totalRecipes": "number",
    "limit": "number"
  }
}

// POST /api/recipes
Request: {
  "title": "string",
  "description": "string",
  "ingredients": "string[]",
  "steps": "string[]",
  "prepTime": "number",
  "difficulty": "string",
  "category": "string",
  "imageUrl": "string"
}
Response: {
  "recipe": { /* full recipe object */ }
}
```

## Data Models

### Database Schema

#### Users Table
```sql
CREATE TABLE Users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

#### Recipes Table
```sql
CREATE TABLE Recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  ingredients JSON NOT NULL,
  steps JSON NOT NULL,
  prep_time INT,  -- in minutes
  difficulty ENUM('easy', 'medium', 'hard'),
  category VARCHAR(50) NOT NULL,
  image_url VARCHAR(500),
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_author (author_id),
  INDEX idx_title (title),
  FULLTEXT INDEX idx_search (title, description)
);
```

#### Categories Table
```sql
CREATE TABLE Categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate with standard categories
INSERT INTO Categories (name, description) VALUES
  ('Vegetarian', 'Recipes without meat'),
  ('Non-Vegetarian', 'Recipes with meat'),
  ('Desserts', 'Sweet dishes and treats'),
  ('Breakfast', 'Morning meals'),
  ('Lunch', 'Midday meals'),
  ('Dinner', 'Evening meals'),
  ('Snacks', 'Quick bites');
```

#### Favorites Table
```sql
CREATE TABLE Favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, recipe_id),
  INDEX idx_user_favorites (user_id)
);
```

#### Ratings Table
```sql
CREATE TABLE Ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (user_id, recipe_id),
  INDEX idx_recipe_ratings (recipe_id)
);
```

### Entity Relationships

```
Users (1) ──────< (M) Recipes
  │                     │
  │                     │
  │ (M)             (M) │
  │                     │
  └──< Favorites >──────┘
  │                     │
  │ (M)             (M) │
  │                     │
  └────< Ratings >──────┘

Categories (1) ────< (M) Recipes (via category field)
```

### Data Validation Rules

**User:**
- Email: Valid email format, unique, max 255 characters
- Password: Minimum 8 characters, hashed with bcrypt (cost factor 10)
- Name: 2-100 characters, non-empty
- Role: Must be 'user' or 'admin'

**Recipe:**
- Title: 5-200 characters, non-empty
- Ingredients: Array with at least 1 item, each item 1-500 characters
- Steps: Array with at least 1 item, each item 1-1000 characters
- Prep Time: Positive integer (minutes)
- Difficulty: Must be 'easy', 'medium', or 'hard'
- Category: Must match existing category name
- Image URL: Valid URL format or empty

**Rating:**
- Rating value: Integer between 1 and 5 inclusive
- Review: Optional, max 1000 characters
- User can only rate each recipe once (enforced by unique constraint)

**Favorite:**
- User can only favorite each recipe once (enforced by unique constraint)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and Authorization Properties

**Property 1: Password hashing universality**
*For any* user registration with valid credentials, the stored password in the database should be a bcrypt hash and not the plaintext password.
**Validates: Requirements 1.1, 1.5**

**Property 2: Valid login generates token**
*For any* registered user with correct credentials, logging in should generate a valid JWT token that grants access to protected endpoints.
**Validates: Requirements 1.2**

**Property 3: Token expiration enforcement**
*For any* expired JWT token, attempting to access protected resources should result in rejection with 401 unauthorized status.
**Validates: Requirements 1.3**

**Property 4: Duplicate email rejection**
*For any* existing user email, attempting to register a new account with the same email should be rejected with an appropriate error message.
**Validates: Requirements 1.4**

**Property 5: Unauthenticated access denial**
*For any* protected API endpoint, requests without a valid authentication token should be rejected with 401 unauthorized status.
**Validates: Requirements 11.1**

**Property 6: Role-based authorization**
*For any* user without admin role, attempting to perform admin-only actions should be rejected with 403 forbidden status.
**Validates: Requirements 11.2, 6.5**

**Property 7: Token tampering detection**
*For any* JWT token with modified payload or signature, the system should detect the tampering and reject authentication.
**Validates: Requirements 11.3**

**Property 8: Logout token invalidation**
*For any* authenticated user, after logout the authentication token should be cleared from client storage and no longer grant access.
**Validates: Requirements 11.5**

### Recipe Management Properties

**Property 9: Valid recipe creation**
*For any* authenticated user with valid recipe data (title, ingredients, steps, category), creating a recipe should result in the recipe being stored in the database with all provided fields.
**Validates: Requirements 2.1, 2.5**

**Property 10: Recipe image association**
*For any* recipe created with an image URL, the image should be associated with the recipe and retrievable when fetching recipe details.
**Validates: Requirements 2.2**

**Property 11: Creation timestamp immutability**
*For any* recipe, updating the recipe should preserve the original creation timestamp while updating the modification timestamp.
**Validates: Requirements 2.3**

**Property 12: Recipe ownership authorization**
*For any* recipe and user where the user is not the author and not an admin, attempting to edit the recipe should be rejected with authorization error.
**Validates: Requirements 2.4**

**Property 13: Required field validation**
*For any* recipe submission missing required fields (title, ingredients, steps, or category), the system should reject the submission with specific validation error messages.
**Validates: Requirements 2.5, 9.1**

**Property 14: Title length validation**
*For any* recipe with a title exceeding 200 characters, the system should reject the submission with an appropriate error message.
**Validates: Requirements 9.2**

**Property 15: Empty list validation**
*For any* recipe with empty ingredients or steps arrays, the system should prevent creation and return validation errors.
**Validates: Requirements 9.3**

**Property 16: Prep time validation**
*For any* recipe with negative or non-numeric preparation time, the system should reject the input and request valid data.
**Validates: Requirements 9.4**

**Property 17: Admin universal edit access**
*For any* recipe and admin user, the admin should be able to edit the recipe regardless of who created it.
**Validates: Requirements 6.4**

### Recipe Discovery Properties

**Property 18: Pagination correctness**
*For any* recipe collection and page size, the pagination should correctly divide recipes into pages with accurate page counts and navigation.
**Validates: Requirements 3.1**

**Property 19: Search query matching**
*For any* search query, all returned recipes should contain the query string in either the title, ingredients, or author name.
**Validates: Requirements 3.2**

**Property 20: Category filter accuracy**
*For any* selected category filter, all returned recipes should belong to that category and no recipes from other categories should be included.
**Validates: Requirements 3.3**

**Property 21: Sort order correctness**
*For any* sort criteria (popularity, rating, or prep time), the returned recipes should be ordered correctly according to that criteria in descending or ascending order as appropriate.
**Validates: Requirements 3.4**

**Property 22: Recipe detail completeness**
*For any* recipe, the detail view should include all recipe fields: title, description, ingredients, steps, prep time, difficulty, category, image, author, ratings, and reviews.
**Validates: Requirements 3.5**

**Property 23: User recipe portfolio completeness**
*For any* user, the "My Recipes" page should display all and only recipes created by that user.
**Validates: Requirements 8.1**

**Property 24: Recipe statistics accuracy**
*For any* user's recipe portfolio, the displayed statistics (view counts, average ratings) should accurately reflect the actual data.
**Validates: Requirements 8.2**

### Favorites Properties

**Property 25: Favorite addition and retrieval**
*For any* authenticated user and recipe, after marking the recipe as favorite, the recipe should appear in the user's favorites list.
**Validates: Requirements 4.1, 4.3**

**Property 26: Favorite removal preserves recipe**
*For any* favorited recipe, removing it from favorites should delete only the favorite association while the original recipe remains in the database unchanged.
**Validates: Requirements 4.2**

**Property 27: Favorite status indication**
*For any* recipe that a user has favorited, viewing the recipe should display a visual indicator of the favorite status.
**Validates: Requirements 4.4**

### Rating and Review Properties

**Property 28: Rating storage and association**
*For any* authenticated user and recipe, submitting a valid rating (1-5) should store the rating and correctly associate it with both the user and recipe.
**Validates: Requirements 5.1**

**Property 29: Review text persistence**
*For any* rating submitted with review text, both the numeric rating and text review should be stored and retrievable together.
**Validates: Requirements 5.2**

**Property 30: Average rating calculation**
*For any* recipe with multiple ratings, the displayed average rating should equal the arithmetic mean of all rating values for that recipe.
**Validates: Requirements 5.3**

**Property 31: Rating update idempotence**
*For any* user and recipe, submitting multiple ratings should result in only one rating record, with subsequent submissions updating the existing rating rather than creating duplicates.
**Validates: Requirements 5.4**

**Property 32: Review display completeness**
*For any* recipe with reviews, the recipe detail page should display all reviews with reviewer names and timestamps.
**Validates: Requirements 5.5**

### Administrative Properties

**Property 33: Admin access privileges**
*For any* user with admin role, logging in should grant access to administrative functions including the admin dashboard, recipe approval, and deletion capabilities.
**Validates: Requirements 6.1**

**Property 34: Cascade deletion integrity**
*For any* recipe with associated favorites and ratings, deleting the recipe (admin action) should remove the recipe and all associated data from the database.
**Validates: Requirements 6.2, 13.3**

**Property 35: Admin dashboard data accuracy**
*For any* admin viewing the dashboard, the displayed pending recipes and system statistics should accurately reflect the current database state.
**Validates: Requirements 6.3**

### Category Properties

**Property 36: Category requirement enforcement**
*For any* recipe submission without a category, the system should reject the creation and return a validation error.
**Validates: Requirements 7.2**

**Property 37: Category list with counts**
*For any* request for the categories list, the response should include all categories with accurate recipe counts for each category.
**Validates: Requirements 7.3**

**Property 38: Multiple category display**
*For any* recipe assigned to multiple categories, all category tags should be displayed when viewing the recipe.
**Validates: Requirements 7.4**

### Data Persistence Properties

**Property 39: Immediate recipe persistence**
*For any* recipe creation, the recipe data should be immediately queryable from the database after the creation operation completes.
**Validates: Requirements 13.1**

**Property 40: Favorite persistence across sessions**
*For any* user who favorites a recipe, the favorite relationship should persist after logout and be present when the user logs back in.
**Validates: Requirements 13.2**

## Error Handling

### Error Categories and Responses

**Validation Errors (400 Bad Request):**
- Missing required fields
- Invalid data formats
- Field length violations
- Invalid enum values
- Empty arrays where content is required

```json
{
  "error": "Validation Error",
  "message": "Recipe validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required and must be between 5-200 characters"
    },
    {
      "field": "ingredients",
      "message": "At least one ingredient is required"
    }
  ]
}
```

**Authentication Errors (401 Unauthorized):**
- Missing JWT token
- Invalid JWT token
- Expired JWT token
- Tampered JWT token

```json
{
  "error": "Authentication Error",
  "message": "Invalid or expired token. Please log in again."
}
```

**Authorization Errors (403 Forbidden):**
- Insufficient permissions for action
- Attempting to modify another user's resource
- Non-admin accessing admin endpoints

```json
{
  "error": "Authorization Error",
  "message": "You do not have permission to perform this action"
}
```

**Not Found Errors (404 Not Found):**
- Recipe ID doesn't exist
- User ID doesn't exist
- Category doesn't exist

```json
{
  "error": "Not Found",
  "message": "Recipe with ID 123 not found"
}
```

**Conflict Errors (409 Conflict):**
- Duplicate email registration
- Unique constraint violations

```json
{
  "error": "Conflict",
  "message": "An account with this email already exists"
}
```

**Server Errors (500 Internal Server Error):**
- Database connection failures
- Unexpected exceptions
- File upload failures

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "requestId": "uuid-for-tracking"
}
```

### Error Handling Strategy

**Backend Error Middleware:**
```javascript
// Global error handler
app.use((err, req, res, next) => {
  // Log error for monitoring
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  // Determine error type and response
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Token expired. Please log in again.'
    });
  }

  // Default to 500 for unknown errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    requestId: req.id
  });
});
```

**Frontend Error Handling:**
- Display user-friendly error messages in UI
- Show validation errors inline with form fields
- Provide retry mechanisms for network failures
- Redirect to login on 401 errors
- Log errors to monitoring service (optional)

**Database Error Handling:**
- Catch and transform SQL errors into application errors
- Handle connection pool exhaustion gracefully
- Implement retry logic for transient failures
- Validate foreign key constraints before operations

## Testing Strategy

### Unit Testing

**Backend Unit Tests (Jest/Mocha):**
- Controller functions with mocked services
- Validation functions with various inputs
- JWT token generation and verification
- Password hashing and comparison
- Database query builders
- Error handling middleware

**Frontend Unit Tests (Jest + React Testing Library):**
- Component rendering with different props
- Form validation logic
- API client functions
- Authentication context behavior
- Utility functions (date formatting, text truncation)

**Example Unit Tests:**
```javascript
// Backend: Recipe validation
describe('Recipe Validation', () => {
  test('should reject recipe without title', () => {
    const recipe = { ingredients: ['flour'], steps: ['mix'] };
    expect(() => validateRecipe(recipe)).toThrow('Title is required');
  });

  test('should accept valid recipe', () => {
    const recipe = {
      title: 'Pasta',
      ingredients: ['pasta', 'sauce'],
      steps: ['boil', 'mix'],
      category: 'Lunch'
    };
    expect(validateRecipe(recipe)).toBe(true);
  });
});

// Frontend: RecipeCard component
describe('RecipeCard', () => {
  test('should display recipe title and rating', () => {
    const recipe = { title: 'Pasta', averageRating: 4.5 };
    render(<RecipeCard recipe={recipe} />);
    expect(screen.getByText('Pasta')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});
```

### Property-Based Testing

**Testing Framework:** We will use **fast-check** for JavaScript/TypeScript property-based testing.

**Configuration:** Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Tagging:** Each property-based test will include a comment tag in the format:
`// Feature: campus-cook, Property {number}: {property_text}`

**Property Test Implementation Guidelines:**

1. **Generators:** Create smart generators that produce valid domain objects
   - User generator: valid emails, passwords, names
   - Recipe generator: valid titles, ingredient lists, steps
   - Rating generator: values 1-5
   - Token generator: valid and invalid JWT tokens

2. **Test Structure:** Each property test should:
   - Generate random valid inputs
   - Execute the operation
   - Assert the property holds
   - Clean up test data

3. **Example Property Tests:**

```javascript
const fc = require('fast-check');

// Feature: campus-cook, Property 1: Password hashing universality
describe('Property 1: Password hashing universality', () => {
  test('all registered users have hashed passwords', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 2, maxLength: 100 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 })
        }),
        async (userData) => {
          // Create user
          const user = await createUser(userData);
          
          // Fetch from database
          const storedUser = await db.query('SELECT * FROM Users WHERE id = ?', [user.id]);
          
          // Assert password is hashed (not plaintext)
          expect(storedUser.password_hash).not.toBe(userData.password);
          expect(storedUser.password_hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt format
          
          // Cleanup
          await db.query('DELETE FROM Users WHERE id = ?', [user.id]);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: campus-cook, Property 19: Search query matching
describe('Property 19: Search query matching', () => {
  test('all search results contain the query string', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(recipeGenerator(), { minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        async (recipes, searchQuery) => {
          // Setup: Insert recipes
          await insertRecipes(recipes);
          
          // Execute search
          const results = await searchRecipes(searchQuery);
          
          // Assert: All results match query
          results.forEach(recipe => {
            const matchesTitle = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesIngredients = recipe.ingredients.some(ing => 
              ing.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const matchesAuthor = recipe.authorName.toLowerCase().includes(searchQuery.toLowerCase());
            
            expect(matchesTitle || matchesIngredients || matchesAuthor).toBe(true);
          });
          
          // Cleanup
          await deleteRecipes(recipes.map(r => r.id));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: campus-cook, Property 30: Average rating calculation
describe('Property 30: Average rating calculation', () => {
  test('displayed average equals arithmetic mean of all ratings', async () => {
    await fc.assert(
      fc.asyncProperty(
        recipeGenerator(),
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 20 }),
        async (recipe, ratings) => {
          // Setup: Create recipe and users
          const createdRecipe = await createRecipe(recipe);
          const users = await createMultipleUsers(ratings.length);
          
          // Add ratings
          for (let i = 0; i < ratings.length; i++) {
            await addRating(users[i].id, createdRecipe.id, ratings[i]);
          }
          
          // Fetch recipe with average
          const recipeWithRating = await getRecipeById(createdRecipe.id);
          
          // Calculate expected average
          const expectedAverage = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          
          // Assert average is correct (with floating point tolerance)
          expect(Math.abs(recipeWithRating.averageRating - expectedAverage)).toBeLessThan(0.01);
          
          // Cleanup
          await deleteRecipe(createdRecipe.id);
          await deleteUsers(users.map(u => u.id));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: campus-cook, Property 34: Cascade deletion integrity
describe('Property 34: Cascade deletion integrity', () => {
  test('deleting recipe removes all associated data', async () => {
    await fc.assert(
      fc.asyncProperty(
        recipeGenerator(),
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 10 }),
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
        async (recipe, ratings, favorites) => {
          // Setup: Create recipe, users, ratings, and favorites
          const createdRecipe = await createRecipe(recipe);
          const users = await createMultipleUsers(Math.max(ratings.length, favorites.length));
          
          // Add ratings
          for (let i = 0; i < ratings.length; i++) {
            await addRating(users[i].id, createdRecipe.id, ratings[i]);
          }
          
          // Add favorites
          for (let i = 0; i < favorites.length; i++) {
            if (favorites[i]) {
              await addFavorite(users[i].id, createdRecipe.id);
            }
          }
          
          // Delete recipe
          await deleteRecipe(createdRecipe.id);
          
          // Assert recipe is gone
          const recipeExists = await recipeExistsInDb(createdRecipe.id);
          expect(recipeExists).toBe(false);
          
          // Assert all ratings are gone
          const remainingRatings = await getRatingsForRecipe(createdRecipe.id);
          expect(remainingRatings).toHaveLength(0);
          
          // Assert all favorites are gone
          const remainingFavorites = await getFavoritesForRecipe(createdRecipe.id);
          expect(remainingFavorites).toHaveLength(0);
          
          // Cleanup users
          await deleteUsers(users.map(u => u.id));
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Custom Generators:**
```javascript
// Recipe generator
const recipeGenerator = () => fc.record({
  title: fc.string({ minLength: 5, maxLength: 200 }),
  description: fc.string({ maxLength: 1000 }),
  ingredients: fc.array(fc.string({ minLength: 1, maxLength: 500 }), { minLength: 1, maxLength: 20 }),
  steps: fc.array(fc.string({ minLength: 1, maxLength: 1000 }), { minLength: 1, maxLength: 15 }),
  prepTime: fc.integer({ min: 1, max: 300 }),
  difficulty: fc.constantFrom('easy', 'medium', 'hard'),
  category: fc.constantFrom('Vegetarian', 'Non-Vegetarian', 'Desserts', 'Breakfast', 'Lunch', 'Dinner'),
  imageUrl: fc.option(fc.webUrl(), { nil: null })
});

// User generator
const userGenerator = () => fc.record({
  name: fc.string({ minLength: 2, maxLength: 100 }),
  email: fc.emailAddress(),
  password: fc.string({ minLength: 8, maxLength: 50 }),
  role: fc.constantFrom('user', 'admin')
});

// JWT token generator (valid)
const validTokenGenerator = () => fc.record({
  userId: fc.integer({ min: 1, max: 10000 }),
  email: fc.emailAddress(),
  role: fc.constantFrom('user', 'admin')
}).map(payload => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }));

// JWT token generator (tampered)
const tamperedTokenGenerator = () => validTokenGenerator().map(token => {
  const parts = token.split('.');
  // Modify payload
  parts[1] = Buffer.from(JSON.stringify({ userId: 999999 })).toString('base64');
  return parts.join('.');
});
```

### Integration Testing

**API Integration Tests:**
- Full request/response cycles through Express app
- Database interactions with test database
- Authentication flow from signup to protected endpoints
- Recipe CRUD operations end-to-end
- Search and filter operations with real database queries

**Frontend Integration Tests:**
- User flows: signup → login → create recipe → view recipe
- Navigation between pages
- Form submission with API calls
- Error handling and display

### Test Database Strategy

- Use separate test database instance
- Reset database state before each test suite
- Use transactions for test isolation where possible
- Seed database with known test data for integration tests
- Clean up test data after property tests

### Testing Coverage Goals

- Unit test coverage: >80% for business logic
- Property tests: All 40 correctness properties implemented
- Integration tests: All major user flows covered
- API endpoint coverage: 100% of endpoints tested

## Deployment Architecture

### Frontend Deployment (Vercel/Netlify)

**Build Configuration:**
```json
{
  "build": {
    "command": "npm run build",
    "publish": "build"
  },
  "env": {
    "REACT_APP_API_URL": "https://api.campuscook.com"
  }
}
```

**Features:**
- Automatic deployments from Git repository
- Preview deployments for pull requests
- CDN distribution for fast global access
- HTTPS by default
- Environment variable management

### Backend Deployment (Render/Railway)

**Configuration:**
```yaml
services:
  - type: web
    name: campuscook-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
```

**Features:**
- Automatic deployments from Git
- Health check endpoints
- Auto-scaling capabilities
- Environment variable management
- SSL/TLS termination

### Database Deployment (PlanetScale/MySQL)

**Connection Configuration:**
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
```

**Features:**
- Automatic backups
- Connection pooling
- SSL connections
- Branching for development (PlanetScale)
- Query insights and monitoring

### Environment Variables

**Frontend (.env):**
```
REACT_APP_API_URL=https://api.campuscook.com
REACT_APP_ENV=production
```

**Backend (.env):**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@host:3306/campuscook
JWT_SECRET=<generated-secret>
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
CORS_ORIGIN=https://campuscook.com
```

### Monitoring and Logging

**Application Logging:**
- Structured JSON logs
- Log levels: error, warn, info, debug
- Request/response logging
- Error stack traces in development

**Monitoring Metrics:**
- API response times
- Error rates
- Database query performance
- User authentication success/failure rates
- Recipe creation/view statistics

### Security Considerations

**HTTPS/TLS:**
- All traffic encrypted in transit
- Automatic certificate management

**CORS Configuration:**
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**SQL Injection Prevention:**
- Use parameterized queries exclusively
- Never concatenate user input into SQL strings
- Validate and sanitize all inputs

**XSS Prevention:**
- Sanitize user-generated content before display
- Use React's built-in XSS protection
- Set appropriate Content-Security-Policy headers

## Performance Optimization

### Database Optimization

**Indexing Strategy:**
- Primary keys on all tables (auto-indexed)
- Index on Users.email for login queries
- Index on Recipes.category for filtering
- Index on Recipes.author_id for user recipe queries
- Composite index on Favorites(user_id, recipe_id)
- Composite index on Ratings(recipe_id, user_id)
- Full-text index on Recipes(title, description) for search

**Query Optimization:**
- Use JOIN operations instead of multiple queries
- Implement pagination to limit result sets
- Cache frequently accessed data (categories list)
- Use SELECT with specific columns instead of SELECT *

### Frontend Optimization

**Code Splitting:**
- Lazy load routes with React.lazy()
- Split vendor bundles from application code
- Load admin components only for admin users

**Image Optimization:**
- Compress images before upload
- Use responsive images with srcset
- Lazy load images below the fold
- Consider CDN for image hosting

**Caching Strategy:**
- Cache API responses in React Query or SWR
- Cache static assets with service workers
- Set appropriate Cache-Control headers

### API Optimization

**Response Compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

**Connection Pooling:**
- Reuse database connections
- Configure appropriate pool size
- Handle connection errors gracefully

**Pagination:**
- Default page size: 12 recipes
- Maximum page size: 50 recipes
- Include pagination metadata in responses
