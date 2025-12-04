# Requirements Document

## Introduction

CampusCook is a smart recipe management and sharing system designed specifically for college students. The system addresses the challenge of daily food planning by providing a centralized digital platform where students can add, browse, share, and manage recipes tailored for hostel life and college communities. The system replaces fragmented recipe sources (WhatsApp forwards, social media, random searches) with an organized, verified, and student-friendly recipe repository.

## Glossary

- **CampusCook System**: The complete web-based recipe management and sharing platform
- **User**: A registered college student who can browse, add, and manage recipes
- **Admin**: A privileged user who can approve, edit, and delete any recipe
- **Recipe**: A structured document containing ingredients, preparation steps, cooking time, difficulty level, and optional images
- **Category**: A classification tag for recipes (e.g., vegetarian, non-vegetarian, desserts, breakfast)
- **Favorite**: A user's saved recipe for quick access
- **Rating**: A numerical score (1-5) and optional text review provided by users for recipes
- **Authentication Token**: A JWT (JSON Web Token) used to verify user identity and authorize access
- **Recipe List**: A paginated view displaying multiple recipes with filtering and sorting capabilities

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a college student, I want to create an account and securely log in, so that I can access personalized recipe features and contribute to the community.

#### Acceptance Criteria

1. WHEN a user submits valid registration information (email, password, name), THE CampusCook System SHALL create a new user account with hashed password storage
2. WHEN a user submits valid login credentials, THE CampusCook System SHALL generate a JWT authentication token and grant access to protected features
3. WHEN a user's authentication token expires, THE CampusCook System SHALL require re-authentication before allowing access to protected resources
4. WHEN a user attempts to register with an already-existing email, THE CampusCook System SHALL reject the registration and return an appropriate error message
5. THE CampusCook System SHALL hash all user passwords using bcrypt before storing them in the database

### Requirement 2: Recipe Creation and Management

**User Story:** As a user, I want to add new recipes with detailed information, so that I can share my cooking knowledge with other students.

#### Acceptance Criteria

1. WHEN an authenticated user submits a new recipe with required fields (title, ingredients, steps, category), THE CampusCook System SHALL create and store the recipe in the database
2. WHEN a user uploads an image with a recipe, THE CampusCook System SHALL store the image and associate it with the recipe
3. WHEN a user edits their own recipe, THE CampusCook System SHALL update the recipe information while preserving the original creation timestamp
4. WHEN a user attempts to edit another user's recipe, THE CampusCook System SHALL reject the request and return an authorization error
5. THE CampusCook System SHALL require recipes to include title, ingredients list, preparation steps, and category classification

### Requirement 3: Recipe Browsing and Discovery

**User Story:** As a user, I want to browse and search for recipes easily, so that I can find meals that match my preferences and available ingredients.

#### Acceptance Criteria

1. WHEN a user accesses the recipe list page, THE CampusCook System SHALL display recipes in a paginated format with navigation controls
2. WHEN a user enters a search query, THE CampusCook System SHALL return recipes matching the query in title, ingredients, or author name
3. WHEN a user applies a filter by category, THE CampusCook System SHALL display only recipes belonging to the selected category
4. WHEN a user selects a sort option, THE CampusCook System SHALL reorder recipes according to the selected criteria (popularity, rating, or preparation time)
5. WHEN a user clicks on a recipe, THE CampusCook System SHALL display the complete recipe details including ingredients, steps, images, and ratings

### Requirement 4: Favorites Management

**User Story:** As a user, I want to save my favorite recipes, so that I can quickly access recipes I cook frequently.

#### Acceptance Criteria

1. WHEN an authenticated user marks a recipe as favorite, THE CampusCook System SHALL add the recipe to the user's favorites collection
2. WHEN a user removes a recipe from favorites, THE CampusCook System SHALL delete the association while preserving the original recipe
3. WHEN a user accesses their favorites page, THE CampusCook System SHALL display all recipes the user has marked as favorite
4. WHEN a user views a recipe they have favorited, THE CampusCook System SHALL indicate the favorite status visually

### Requirement 5: Recipe Rating and Review System

**User Story:** As a user, I want to rate and review recipes I've tried, so that I can help other students make informed cooking decisions.

#### Acceptance Criteria

1. WHEN an authenticated user submits a rating for a recipe, THE CampusCook System SHALL store the rating value (1-5) and associate it with the user and recipe
2. WHEN a user submits a review text with a rating, THE CampusCook System SHALL store both the rating and review content
3. WHEN multiple users rate a recipe, THE CampusCook System SHALL calculate and display the average rating
4. WHEN a user attempts to rate the same recipe multiple times, THE CampusCook System SHALL update their existing rating rather than creating a duplicate
5. WHEN a recipe detail page is displayed, THE CampusCook System SHALL show all user reviews with reviewer names and timestamps

### Requirement 6: Administrative Recipe Management

**User Story:** As an admin, I want to manage all recipes in the system, so that I can maintain quality and remove inappropriate content.

#### Acceptance Criteria

1. WHEN an admin user logs in, THE CampusCook System SHALL grant access to administrative functions including recipe approval and deletion
2. WHEN an admin deletes a recipe, THE CampusCook System SHALL remove the recipe and all associated data (ratings, favorites) from the database
3. WHEN an admin views the admin dashboard, THE CampusCook System SHALL display pending recipes awaiting approval and system statistics
4. WHEN an admin edits any recipe, THE CampusCook System SHALL allow the modification regardless of recipe ownership
5. THE CampusCook System SHALL distinguish admin users from regular users through role-based access control

### Requirement 7: Recipe Categories and Classification

**User Story:** As a user, I want recipes organized by categories, so that I can easily find specific types of meals.

#### Acceptance Criteria

1. THE CampusCook System SHALL support multiple recipe categories including vegetarian, non-vegetarian, desserts, breakfast, lunch, and dinner
2. WHEN a user creates a recipe, THE CampusCook System SHALL require selection of at least one category
3. WHEN a user requests the categories list, THE CampusCook System SHALL return all available categories with recipe counts
4. WHEN a recipe belongs to multiple categories, THE CampusCook System SHALL display all applicable category tags

### Requirement 8: User Recipe Portfolio

**User Story:** As a user, I want to view all recipes I've created, so that I can manage my contributions to the community.

#### Acceptance Criteria

1. WHEN a user accesses the "My Recipes" page, THE CampusCook System SHALL display all recipes created by that user
2. WHEN a user views their recipe portfolio, THE CampusCook System SHALL show recipe statistics including view counts and average ratings
3. WHEN a user selects a recipe from their portfolio, THE CampusCook System SHALL provide quick access to edit or delete options

### Requirement 9: Recipe Data Validation

**User Story:** As a system administrator, I want recipe data to be validated, so that the database maintains consistency and quality.

#### Acceptance Criteria

1. WHEN a recipe is submitted without required fields, THE CampusCook System SHALL reject the submission and return specific validation error messages
2. WHEN a recipe title exceeds maximum length limits, THE CampusCook System SHALL reject the submission with an appropriate error message
3. WHEN ingredient or step lists are empty, THE CampusCook System SHALL prevent recipe creation
4. WHEN a preparation time value is negative or non-numeric, THE CampusCook System SHALL reject the input and request valid data

### Requirement 10: Responsive User Interface

**User Story:** As a mobile user, I want the application to work well on my phone, so that I can access recipes while cooking in the hostel kitchen.

#### Acceptance Criteria

1. WHEN a user accesses CampusCook from a mobile device, THE CampusCook System SHALL display a responsive layout optimized for the screen size
2. WHEN a user accesses CampusCook from a tablet, THE CampusCook System SHALL adapt the interface to utilize the available screen space effectively
3. WHEN a user accesses CampusCook from a desktop browser, THE CampusCook System SHALL display the full-featured interface with optimal spacing and layout
4. WHEN a user rotates their mobile device, THE CampusCook System SHALL adjust the layout to accommodate the new orientation

### Requirement 11: API Security and Authorization

**User Story:** As a system architect, I want secure API endpoints, so that user data and recipes are protected from unauthorized access.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access protected endpoints, THE CampusCook System SHALL reject the request with a 401 unauthorized status
2. WHEN a user attempts to perform an action beyond their role permissions, THE CampusCook System SHALL reject the request with a 403 forbidden status
3. WHEN a JWT token is tampered with, THE CampusCook System SHALL detect the invalid signature and reject the authentication
4. THE CampusCook System SHALL include authentication tokens in HTTP-only secure headers for all authenticated requests
5. WHEN a user logs out, THE CampusCook System SHALL invalidate the authentication token on the client side

### Requirement 12: Recipe Search Performance

**User Story:** As a user, I want search results to appear quickly, so that I can find recipes without waiting.

#### Acceptance Criteria

1. WHEN a user performs a search query, THE CampusCook System SHALL return results within 2 seconds for databases containing up to 10,000 recipes
2. WHEN a user applies multiple filters simultaneously, THE CampusCook System SHALL process the combined query efficiently
3. THE CampusCook System SHALL implement database indexing on frequently searched fields (title, ingredients, category)

### Requirement 13: Data Persistence and Integrity

**User Story:** As a user, I want my recipes and data to be safely stored, so that I don't lose my contributions.

#### Acceptance Criteria

1. WHEN a recipe is created, THE CampusCook System SHALL persist the data to the MySQL database immediately
2. WHEN a user favorites a recipe, THE CampusCook System SHALL maintain the relationship even after the user logs out and logs back in
3. WHEN a recipe is deleted, THE CampusCook System SHALL remove all associated favorites and ratings to maintain referential integrity
4. THE CampusCook System SHALL enforce foreign key constraints between Users, Recipes, Favorites, and Ratings tables
