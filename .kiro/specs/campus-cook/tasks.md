# Implementation Plan

- [x] 1. Initialize project structure and dependencies
  - Create backend directory with Express.js setup
  - Create frontend directory with React setup
  - Install core dependencies: express, mysql2, bcrypt, jsonwebtoken, cors, react, react-router-dom, axios, tailwindcss
  - Configure environment variables for both frontend and backend
  - Set up basic folder structure (controllers, routes, middleware, components, pages)
  - _Requirements: All_

- [x] 2. Set up database schema and connection
  - Create MySQL database connection pool with proper configuration
  - Write SQL schema for Users table with indexes
  - Write SQL schema for Recipes table with indexes and foreign keys
  - Write SQL schema for Categories table with pre-populated data
  - Write SQL schema for Favorites table with composite unique constraint
  - Write SQL schema for Ratings table with composite unique constraint
  - Create database initialization script
  - _Requirements: 13.4_

- [x] 3. Implement authentication system
  - [x] 3.1 Create user registration endpoint
    - Implement POST /api/auth/signup with validation
    - Hash passwords using bcrypt before storage
    - Return JWT token and user data on successful registration
    - _Requirements: 1.1, 1.5_
  
  - [x] 3.2 Write property test for password hashing
    - **Property 1: Password hashing universality**
    - **Validates: Requirements 1.1, 1.5**
  
  - [x] 3.3 Create user login endpoint
    - Implement POST /api/auth/login with credential validation
    - Compare hashed passwords using bcrypt
    - Generate and return JWT token on successful login
    - _Requirements: 1.2_
  
  - [x] 3.4 Write property test for login token generation
    - **Property 2: Valid login generates token**
    - **Validates: Requirements 1.2**
  
  - [x] 3.5 Create JWT authentication middleware
    - Implement authenticateToken middleware to verify JWT
    - Extract user information from token and attach to request
    - Handle expired and invalid tokens appropriately
    - _Requirements: 1.3, 11.1, 11.3_
  
  - [x] 3.6 Write property tests for authentication middleware
    - **Property 3: Token expiration enforcement**
    - **Property 5: Unauthenticated access denial**
    - **Property 7: Token tampering detection**
    - **Validates: Requirements 1.3, 11.1, 11.3**
  
  - [x] 3.7 Create role-based authorization middleware
    - Implement authorizeRole middleware to check user roles
    - Restrict admin-only endpoints to admin users
    - _Requirements: 6.5, 11.2_
  
  - [x] 3.8 Write property test for role-based authorization
    - **Property 6: Role-based authorization**
    - **Validates: Requirements 11.2, 6.5**
  
  - [x] 3.9 Implement duplicate email validation
    - Check for existing email before registration
    - Return appropriate error for duplicate emails
    - _Requirements: 1.4_
  
  - [x] 3.10 Write property test for duplicate email rejection
    - **Property 4: Duplicate email rejection**
    - **Validates: Requirements 1.4**

- [x] 4. Implement recipe CRUD operations
  - [x] 4.1 Create recipe creation endpoint
    - Implement POST /api/recipes with authentication
    - Validate required fields (title, ingredients, steps, category)
    - Store recipe in database with author association
    - _Requirements: 2.1, 2.5_
  
  - [x] 4.2 Write property test for valid recipe creation
    - **Property 9: Valid recipe creation**
    - **Validates: Requirements 2.1, 2.5**
  
  - [x] 4.3 Implement recipe validation logic
    - Validate title length (5-200 characters)
    - Validate non-empty ingredients and steps arrays
    - Validate prep time is positive number
    - Validate category exists
    - Return specific error messages for each validation failure
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 4.4 Write property tests for recipe validation
    - **Property 13: Required field validation**
    - **Property 14: Title length validation**
    - **Property 15: Empty list validation**
    - **Property 16: Prep time validation**
    - **Validates: Requirements 2.5, 9.1, 9.2, 9.3, 9.4**
  
  - [x] 4.5 Create recipe retrieval endpoints
    - Implement GET /api/recipes/:id for single recipe with full details
    - Include author information, ratings, and reviews in response
    - _Requirements: 3.5_
  
  - [x] 4.6 Write property test for recipe detail completeness
    - **Property 22: Recipe detail completeness**
    - **Validates: Requirements 3.5**
  
  - [x] 4.7 Create recipe update endpoint
    - Implement PUT /api/recipes/:id with authentication
    - Verify user owns recipe or is admin
    - Update recipe while preserving creation timestamp
    - _Requirements: 2.3, 2.4, 6.4_
  
  - [x] 4.8 Write property tests for recipe updates
    - **Property 11: Creation timestamp immutability**
    - **Property 12: Recipe ownership authorization**
    - **Property 17: Admin universal edit access**
    - **Validates: Requirements 2.3, 2.4, 6.4**
  
  - [x] 4.9 Create recipe deletion endpoint
    - Implement DELETE /api/recipes/:id with admin authorization
    - Cascade delete associated favorites and ratings
    - _Requirements: 6.2, 13.3_
  
  - [x] 4.10 Write property test for cascade deletion
    - **Property 34: Cascade deletion integrity**
    - **Validates: Requirements 6.2, 13.3**
  
  - [x] 4.11 Implement image upload handling
    - Add image URL field to recipe creation/update
    - Validate image URL format
    - Associate image with recipe
    - _Requirements: 2.2_
  
  - [x] 4.12 Write property test for image association
    - **Property 10: Recipe image association**
    - **Validates: Requirements 2.2**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement recipe discovery features
  - [x] 6.1 Create recipe list endpoint with pagination
    - Implement GET /api/recipes with page and limit parameters
    - Calculate total pages and include pagination metadata
    - Default to 12 recipes per page
    - _Requirements: 3.1_
  
  - [x] 6.2 Write property test for pagination correctness
    - **Property 18: Pagination correctness**
    - **Validates: Requirements 3.1**
  
  - [x] 6.3 Implement search functionality
    - Add search query parameter to recipe list endpoint
    - Search across title, ingredients, and author name using FULLTEXT or LIKE
    - Return only matching recipes
    - _Requirements: 3.2_
  
  - [x] 6.4 Write property test for search matching
    - **Property 19: Search query matching**
    - **Validates: Requirements 3.2**
  
  - [x] 6.5 Implement category filtering
    - Add category filter parameter to recipe list endpoint
    - Return only recipes in selected category
    - _Requirements: 3.3_
  
  - [x] 6.6 Write property test for category filtering
    - **Property 20: Category filter accuracy**
    - **Validates: Requirements 3.3**
  
  - [x] 6.7 Implement sorting functionality
    - Add sort parameter (popularity, rating, prepTime)
    - Order results by selected criteria
    - _Requirements: 3.4_
  
  - [x] 6.8 Write property test for sort correctness
    - **Property 21: Sort order correctness**
    - **Validates: Requirements 3.4**

- [x] 7. Implement category management
  - [x] 7.1 Create categories list endpoint
    - Implement GET /api/categories
    - Return all categories with recipe counts
    - _Requirements: 7.3_
  
  - [x] 7.2 Write property test for category counts
    - **Property 37: Category list with counts**
    - **Validates: Requirements 7.3**
  
  - [x] 7.3 Implement category requirement in recipe creation
    - Enforce category selection during recipe creation
    - Validate category exists in Categories table
    - _Requirements: 7.2_
  
  - [x] 7.4 Write property test for category requirement
    - **Property 36: Category requirement enforcement**
    - **Validates: Requirements 7.2**
  
  - [x] 7.5 Support multiple categories per recipe
    - Allow recipes to have multiple category tags
    - Display all category tags in recipe views
    - _Requirements: 7.4_
  
  - [x] 7.6 Write property test for multiple categories
    - **Property 38: Multiple category display**
    - **Validates: Requirements 7.4**

- [ ] 8. Implement favorites system
  - [x] 8.1 Create add to favorites endpoint
    - Implement POST /api/favorites/:recipeId with authentication
    - Create favorite association in database
    - Handle duplicate favorites gracefully
    - _Requirements: 4.1_
  
  - [x] 8.2 Create remove from favorites endpoint
    - Implement DELETE /api/favorites/:recipeId with authentication
    - Remove favorite association without deleting recipe
    - _Requirements: 4.2_
  
  - [x] 8.3 Write property test for favorite removal
    - **Property 26: Favorite removal preserves recipe**
    - **Validates: Requirements 4.2**
  
  - [x] 8.4 Create get user favorites endpoint
    - Implement GET /api/favorites with authentication
    - Return all recipes user has favorited
    - _Requirements: 4.3_
  
  - [x] 8.5 Write property test for favorites functionality
    - **Property 25: Favorite addition and retrieval**
    - **Validates: Requirements 4.1, 4.3**
  
  - [x] 8.6 Add favorite status to recipe responses
    - Include isFavorited boolean in recipe objects for authenticated users
    - Display visual indicator in UI
    - _Requirements: 4.4_
  
  - [x] 8.7 Write property test for favorite status indication
    - **Property 27: Favorite status indication**
    - **Validates: Requirements 4.4**
  
  - [x] 8.8 Write property test for favorite persistence
    - **Property 40: Favorite persistence across sessions**
    - **Validates: Requirements 13.2**

- [ ] 9. Implement rating and review system
  - [x] 9.1 Create add/update rating endpoint
    - Implement POST /api/ratings/:recipeId with authentication
    - Store rating (1-5) and optional review text
    - Update existing rating if user already rated recipe
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [x] 9.2 Write property tests for rating functionality
    - **Property 28: Rating storage and association**
    - **Property 29: Review text persistence**
    - **Property 31: Rating update idempotence**
    - **Validates: Requirements 5.1, 5.2, 5.4**
  
  - [x] 9.3 Implement average rating calculation
    - Calculate average rating when fetching recipe details
    - Include rating count in response
    - _Requirements: 5.3_
  
  - [x] 9.4 Write property test for average rating
    - **Property 30: Average rating calculation**
    - **Validates: Requirements 5.3**
  
  - [x] 9.5 Create get recipe ratings endpoint
    - Implement GET /api/ratings/recipe/:recipeId
    - Return all reviews with user names and timestamps
    - _Requirements: 5.5_
  
  - [x] 9.6 Write property test for review display
    - **Property 32: Review display completeness**
    - **Validates: Requirements 5.5**

- [ ] 10. Implement user recipe portfolio
  - [x] 10.1 Create user recipes endpoint
    - Implement GET /api/recipes/user/:userId
    - Return all recipes created by specified user
    - Include statistics (view counts, ratings)
    - _Requirements: 8.1, 8.2_
  
  - [x] 10.2 Write property tests for user portfolio
    - **Property 23: User recipe portfolio completeness**
    - **Property 24: Recipe statistics accuracy**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 11. Implement admin features
  - [x] 11.1 Create admin dashboard endpoint
    - Implement GET /api/admin/dashboard with admin authorization
    - Return system statistics and pending recipes
    - _Requirements: 6.3_
  
  - [x] 11.2 Write property test for admin dashboard
    - **Property 35: Admin dashboard data accuracy**
    - **Validates: Requirements 6.3**
  
  - [x] 11.3 Verify admin access privileges
    - Ensure admin users can access all admin endpoints
    - Test admin can edit and delete any recipe
    - _Requirements: 6.1, 6.4_
  
  - [x] 11.4 Write property test for admin privileges
    - **Property 33: Admin access privileges**
    - **Validates: Requirements 6.1**

- [ ] 12. Implement data persistence verification
  - [x] 12.1 Write property test for immediate persistence
    - **Property 39: Immediate recipe persistence**
    - **Validates: Requirements 13.1**

- [x] 13. Implement error handling middleware
  - Create global error handler for Express
  - Handle validation errors with 400 status
  - Handle authentication errors with 401 status
  - Handle authorization errors with 403 status
  - Handle not found errors with 404 status
  - Handle duplicate key errors with 409 status
  - Handle server errors with 500 status
  - Return consistent error response format
  - _Requirements: All error scenarios_

- [x] 14. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Create React frontend structure
  - Initialize React app with Create React App or Vite
  - Set up React Router for navigation
  - Configure Axios for API calls with base URL
  - Set up TailwindCSS for styling
  - Create folder structure (components, pages, contexts, utils)
  - _Requirements: All frontend requirements_

- [x] 16. Implement authentication UI
  - [x] 16.1 Create AuthContext for global auth state
    - Manage JWT token in localStorage
    - Provide login, signup, logout functions
    - Provide current user state
    - _Requirements: 1.1, 1.2, 11.5_
  
  - [x] 16.2 Write property test for logout token invalidation
    - **Property 8: Logout token invalidation**
    - **Validates: Requirements 11.5**
  
  - [x] 16.3 Create SignupForm component
    - Form with name, email, password, confirm password fields
    - Client-side validation
    - Call signup API and store token
    - Redirect to home on success
    - _Requirements: 1.1_
  
  - [x] 16.4 Create LoginForm component
    - Form with email and password fields
    - Call login API and store token
    - Redirect to home on success
    - _Requirements: 1.2_
  
  - [x] 16.5 Create ProtectedRoute component
    - Redirect to login if not authenticated
    - Allow access if authenticated
    - _Requirements: 11.1_

- [x] 17. Implement recipe browsing UI
  - [x] 17.1 Create RecipeList page
    - Display grid of recipe cards
    - Implement pagination controls
    - Show loading and error states
    - _Requirements: 3.1_
  
  - [x] 17.2 Create RecipeCard component
    - Display recipe image, title, rating, prep time
    - Show favorite indicator if user favorited
    - Link to recipe detail page
    - _Requirements: 3.5, 4.4_
  
  - [x] 17.3 Create RecipeSearch component
    - Search input with submit button
    - Update URL params on search
    - Trigger recipe list refresh
    - _Requirements: 3.2_
  
  - [x] 17.4 Create FilterSort component
    - Category filter dropdown
    - Sort options dropdown
    - Update URL params on change
    - _Requirements: 3.3, 3.4_

- [ ] 18. Implement recipe detail UI
  - [x] 18.1 Create RecipeDetail page
    - Fetch and display full recipe information
    - Show ingredients list and preparation steps
    - Display recipe image
    - Show author information
    - Display average rating and rating count
    - _Requirements: 3.5_
  
  - [x] 18.2 Create RatingStars component
    - Display star rating visually
    - Allow interactive rating input
    - _Requirements: 5.1_
  
  - [x] 18.3 Create ReviewList component
    - Display all reviews for recipe
    - Show reviewer name and timestamp
    - Show rating and review text
    - _Requirements: 5.5_
  
  - [x] 18.4 Add favorite button to recipe detail
    - Toggle favorite status on click
    - Update UI immediately
    - Call add/remove favorite API
    - _Requirements: 4.1, 4.2_

- [ ] 19. Implement recipe creation/editing UI
  - [x] 19.1 Create RecipeForm component
    - Form fields for title, description, ingredients, steps
    - Fields for prep time, difficulty, category
    - Image URL input
    - Dynamic add/remove for ingredients and steps
    - Client-side validation
    - _Requirements: 2.1, 2.2_
  
  - [x] 19.2 Create AddRecipe page
    - Use RecipeForm for creation
    - Call create recipe API
    - Redirect to recipe detail on success
    - _Requirements: 2.1_
  
  - [x] 19.3 Create EditRecipe page
    - Load existing recipe data into RecipeForm
    - Call update recipe API
    - Only allow if user owns recipe or is admin
    - _Requirements: 2.3, 2.4_

- [ ] 20. Implement user pages
  - [x] 20.1 Create MyRecipes page
    - Display all recipes created by current user
    - Show recipe statistics
    - Provide edit and delete buttons
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 20.2 Create FavoritesList page
    - Display all favorited recipes
    - Use RecipeCard component
    - Allow removing from favorites
    - _Requirements: 4.3_

- [ ] 21. Implement admin UI
  - [x] 21.1 Create AdminDashboard page
    - Display system statistics
    - Show pending recipes
    - Provide moderation actions
    - Only accessible to admin users
    - _Requirements: 6.1, 6.3_
  
  - [x] 21.2 Add admin controls to recipe pages
    - Show edit/delete buttons on all recipes for admins
    - Allow admins to moderate any content
    - _Requirements: 6.2, 6.4_

- [x] 22. Implement shared UI components
  - Create Navbar component with auth-aware menu
  - Create Pagination component
  - Create LoadingSpinner component
  - Create ErrorBoundary component
  - Create ImageUpload component (if implementing file upload)
  - _Requirements: All UI requirements_

- [x] 23. Implement error handling in frontend
  - Display validation errors inline with forms
  - Show toast notifications for success/error messages
  - Redirect to login on 401 errors
  - Display user-friendly error messages
  - _Requirements: All error scenarios_

- [x] 24. Add responsive design
  - Ensure all pages work on mobile devices
  - Use TailwindCSS responsive utilities
  - Test on different screen sizes
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 25. Final integration testing
  - Test complete user flows end-to-end
  - Verify all API integrations work correctly
  - Test authentication flow from signup to logout
  - Test recipe CRUD operations through UI
  - Test search, filter, and sort functionality
  - Test favorites and ratings functionality
  - Test admin features
  - _Requirements: All_

- [x] 26. Checkpoint - Final verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 27. Prepare for deployment
  - Set up environment variables for production
  - Configure CORS for production frontend URL
  - Set up database connection for production
  - Create deployment configuration files
  - Test production build locally
  - _Requirements: All_
