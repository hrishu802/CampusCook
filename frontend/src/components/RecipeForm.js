import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function RecipeForm({ initialData, onSubmit, submitLabel = 'Create Recipe' }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    steps: [''],
    prep_time: '',
    difficulty: 'easy',
    category: '',
    image_url: ''
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (index, field) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: newArray });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (formData.ingredients.filter(i => i.trim()).length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }
    if (formData.steps.filter(s => s.trim()).length === 0) {
      newErrors.steps = 'At least one step is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.prep_time && formData.prep_time < 1) {
      newErrors.prep_time = 'Prep time must be positive';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        steps: formData.steps.filter(s => s.trim()),
        prep_time: parseInt(formData.prep_time) || undefined
      };
      onSubmit(cleanedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ingredients *</label>
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleArrayChange(index, e.target.value, 'ingredients')}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder={`Ingredient ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, 'ingredients')}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('ingredients')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Add Ingredient
        </button>
        {errors.ingredients && <p className="text-red-600 text-sm mt-1">{errors.ingredients}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Preparation Steps *</label>
        {formData.steps.map((step, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <textarea
              value={step}
              onChange={(e) => handleArrayChange(index, e.target.value, 'steps')}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder={`Step ${index + 1}`}
              rows="2"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, 'steps')}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('steps')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Add Step
        </button>
        {errors.steps && <p className="text-red-600 text-sm mt-1">{errors.steps}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prep Time (minutes)</label>
          <input
            type="number"
            name="prep_time"
            value={formData.prep_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            min="1"
          />
          {errors.prep_time && <p className="text-red-600 text-sm mt-1">{errors.prep_time}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image URL</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export default RecipeForm;
