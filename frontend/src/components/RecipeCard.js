import React from 'react';
import { Link } from 'react-router-dom';

function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {recipe.image_url && (
        <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>⭐ {recipe.averageRating?.toFixed(1) || '0.0'}</span>
          <span>⏱️ {recipe.prep_time} min</span>
          <span className="capitalize">{recipe.difficulty}</span>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
