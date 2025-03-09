import api from './api';

export const UsersService = {
  // Get all users with pagination and filters
  getUsers: async (params) => {
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  // Get a single user by ID
  getUser: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Create a new user
  createUser: async (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (key === 'avatar' && userData[key]) {
        formData.append('avatar', userData[key]);
      } else {
        formData.append(key, userData[key]);
      }
    });

    const response = await api.post('/api/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a user
  updateUser: async (id, userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (key === 'avatar' && userData[key]) {
        formData.append('avatar', userData[key]);
      } else {
        formData.append(key, userData[key]);
      }
    });

    const response = await api.put(`/api/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a user
  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  // Update user role
  updateRole: async (id, role) => {
    const response = await api.patch(`/api/users/${id}/role`, { role });
    return response.data;
  },

  // Get user statistics
  getStatistics: async () => {
    const response = await api.get('/api/users/statistics');
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (key === 'avatar' && userData[key]) {
        formData.append('avatar', userData[key]);
      } else {
        formData.append(key, userData[key]);
      }
    });

    const response = await api.put('/api/users/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/api/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }
}; 