import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchRecipes();
  }, [search, category]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      
      const response = await api.get('/api/recipes', { params });
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Student-Friendly Recipes
        </h1>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name} ({cat.recipeCount})
              </option>
            ))}
          </select>
        </div>

        <Link
          to="/add-recipe"
          className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Add New Recipe
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading recipes...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No recipes found. Be the first to add one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/recipe/${recipe.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {recipe.image_url && (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {recipe.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {recipe.description}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                    {recipe.category}
                  </span>
                  {recipe.prep_time && <span>{recipe.prep_time} min</span>}
                </div>
                {recipe.averageRating > 0 && (
                  <div className="mt-2 text-yellow-500">
                    ★ {recipe.averageRating} ({recipe.ratingCount})
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
