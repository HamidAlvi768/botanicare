import api from './api';

export const ProductsService = {
  // Get all products with pagination and filters
  getProducts: async (params) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  // Get a single product by ID
  getProduct: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Create a new product
  createProduct: async (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        productData[key].forEach(image => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a product
  updateProduct: async (id, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        productData[key].forEach(image => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.put(`/api/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a product
  deleteProduct: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  // Update product inventory
  updateInventory: async (id, quantity) => {
    const response = await api.patch(`/api/products/${id}/inventory`, { quantity });
    return response.data;
  },

  // Get product statistics
  getStatistics: async () => {
    const response = await api.get('/api/products/statistics');
    return response.data;
  }
}; 