import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import api from '../utils/api';

function AddRecipe() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    try {
      const response = await api.post('/recipes', formData);
      navigate(`/recipe/${response.data.recipe.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create recipe');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Create New Recipe</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-6">
        <RecipeForm onSubmit={handleSubmit} submitLabel="Create Recipe" />
      </div>
    </div>
  );
}

export default AddRecipe;
