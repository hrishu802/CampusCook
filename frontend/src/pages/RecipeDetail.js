import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import RatingStars from '../components/RatingStars';
import ReviewList from '../components/ReviewList';
import LoadingSpinner from '../components/LoadingSpinner';

function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecipe();
    fetchRatings();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await api.get(`/recipes/${id}`);
      setRecipe(response.data.recipe);
      setLoading(false);
    } catch (err) {
      setError('Failed to load recipe');
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await api.get(`/ratings/recipe/${id}`);
      setRatings(response.data.ratings);
    } catch (err) {
      console.error('Failed to load ratings');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) return;
    
    try {
      if (recipe.isFavorited) {
        await api.delete(`/favorites/${id}`);
        setRecipe({ ...recipe, isFavorited: false });
      } else {
        await api.post(`/favorites/${id}`);
        setRecipe({ ...recipe, isFavorited: true });
      }
    } catch (err) {
      setError('Failed to update favorite');
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!user || userRating === 0) return;

    setSubmitting(true);
    try {
      await api.post(`/ratings/${id}`, {
        rating: userRating,
        review: userReview
      });
      fetchRecipe();
      fetchRatings();
      setUserRating(0);
      setUserReview('');
    } catch (err) {
      setError('Failed to submit rating');
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!recipe) return <div className="text-center py-8">Recipe not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {recipe.image_url && (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-64 object-cover" />
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
            {user && (
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-full ${recipe.isFavorited ? 'text-red-500' : 'text-gray-400'}`}
              >
                <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
                  <path d="M10 18.35l-1.45-1.32C3.4 12.36 0 9.28 0 5.5 0 2.42 2.42 0 5.5 0c1.74 0 3.41.81 4.5 2.09C11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.78-3.4 6.86-8.55 11.54L10 18.35z"/>
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span className="flex items-center">
              <RatingStars rating={recipe.averageRating} readonly />
              <span className="ml-2">({recipe.ratingCount} reviews)</span>
            </span>
            <span>⏱️ {recipe.prep_time} min</span>
            <span className="capitalize">📊 {recipe.difficulty}</span>
            <span className="capitalize">🏷️ {recipe.category}</span>
          </div>

          <p className="text-gray-700 mb-6">{recipe.description}</p>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Preparation Steps</h2>
            <ol className="list-decimal list-inside space-y-2">
              {recipe.steps.map((step, index) => (
                <li key={index} className="text-gray-700">{step}</li>
              ))}
            </ol>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600">
              By {recipe.author.name} • {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {user && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4">Rate this Recipe</h2>
          <form onSubmit={handleRatingSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <RatingStars rating={userRating} onChange={setUserRating} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review (optional)</label>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows="4"
                placeholder="Share your thoughts about this recipe..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting || userRating === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        </div>
      )}

      <div className="mt-6">
        <ReviewList reviews={ratings} />
      </div>
    </div>
  );
}

export default RecipeDetail;
