import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import RecipeCard from '../components/RecipeCard';
import api from '../utils/api';

function Favorites() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setRecipes(response.data.recipes);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load favorites');
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      await api.delete(`/favorites/${id}`);
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to remove favorite');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>

      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't favorited any recipes yet.</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Browse recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="relative">
              <RecipeCard recipe={recipe} />
              <button
                onClick={() => handleRemoveFavorite(recipe.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                title="Remove from favorites"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
