import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard');
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-8">Failed to load dashboard</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{data.statistics.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Recipes</h3>
          <p className="text-3xl font-bold text-green-600">{data.statistics.totalRecipes}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Ratings</h3>
          <p className="text-3xl font-bold text-purple-600">{data.statistics.totalRatings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Favorites</h3>
          <p className="text-3xl font-bold text-red-600">{data.statistics.totalFavorites}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Recipes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Author</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.recentRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{recipe.title}</td>
                  <td className="py-3 px-4">{recipe.author}</td>
                  <td className="py-3 px-4 capitalize">{recipe.category}</td>
                  <td className="py-3 px-4">{new Date(recipe.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/recipe/${recipe.id}`}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      View
                    </Link>
                    <Link
                      to={`/edit-recipe/${recipe.id}`}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
