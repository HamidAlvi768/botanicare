import api from './api';

export const CategoriesService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  // Get a single category by ID
  getCategory: async (id) => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const formData = new FormData();
    Object.keys(categoryData).forEach(key => {
      if (key === 'image' && categoryData[key]) {
        formData.append('image', categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });

    const response = await api.post('/api/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a category
  updateCategory: async (id, categoryData) => {
    const formData = new FormData();
    Object.keys(categoryData).forEach(key => {
      if (key === 'image' && categoryData[key]) {
        formData.append('image', categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });

    const response = await api.put(`/api/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a category
  deleteCategory: async (id) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },

  // Get category statistics
  getStatistics: async () => {
    const response = await api.get('/api/categories/statistics');
    return response.data;
  }
}; 