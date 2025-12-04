import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RecipeForm from '../components/RecipeForm';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await api.get(`/recipes/${id}`);
      const recipeData = response.data.recipe;
      
      // Check if user owns recipe or is admin
      if (recipeData.author.id !== user.id && user.role !== 'admin') {
        setError('You do not have permission to edit this recipe');
        setLoading(false);
        return;
      }

      setRecipe(recipeData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load recipe');
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.put(`/recipes/${id}`, formData);
      navigate(`/recipe/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update recipe');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!recipe) return <div className="text-center py-8">Recipe not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Edit Recipe</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <RecipeForm initialData={recipe} onSubmit={handleSubmit} submitLabel="Update Recipe" />
      </div>
    </div>
  );
}

export default EditRecipe;
