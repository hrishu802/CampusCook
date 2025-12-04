-- CampusCook Database Schema
-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS Ratings;
DROP TABLE IF EXISTS Favorites;
DROP TABLE IF EXISTS Recipes;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;

-- Users Table
CREATE TABLE Users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE Categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipes Table
CREATE TABLE Recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  ingredients JSON NOT NULL,
  steps JSON NOT NULL,
  prep_time INT COMMENT 'Preparation time in minutes',
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
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Favorites Table
CREATE TABLE Favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, recipe_id),
  INDEX idx_user_favorites (user_id),
  INDEX idx_recipe_favorites (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ratings Table
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
  INDEX idx_recipe_ratings (recipe_id),
  INDEX idx_user_ratings (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
