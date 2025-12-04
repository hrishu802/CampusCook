-- Seed data for CampusCook database

-- Insert Categories
INSERT INTO Categories (name, description) VALUES
  ('Vegetarian', 'Recipes without meat - perfect for vegetarian students'),
  ('Non-Vegetarian', 'Recipes with meat, chicken, or fish'),
  ('Desserts', 'Sweet dishes and treats for satisfying your sweet tooth'),
  ('Breakfast', 'Morning meals to start your day right'),
  ('Lunch', 'Midday meals that are filling and nutritious'),
  ('Dinner', 'Evening meals perfect for winding down'),
  ('Snacks', 'Quick bites for study sessions or between classes'),
  ('Beverages', 'Drinks, smoothies, and refreshing beverages'),
  ('Quick & Easy', 'Recipes that can be made in under 30 minutes'),
  ('Budget-Friendly', 'Affordable recipes perfect for student budgets');

-- Note: Admin users should be created through the signup API endpoint
-- After creating a user, you can manually update their role to 'admin' in the database:
-- UPDATE Users SET role = 'admin' WHERE email = 'your-admin@email.com';
