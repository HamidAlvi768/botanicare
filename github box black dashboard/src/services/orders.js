import api from './api';

export const OrdersService = {
  // Get all orders with pagination and filters
  getOrders: async (params) => {
    const response = await api.get('/api/orders', { params });
    return response.data;
  },

  // Get a single order by ID
  getOrder: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/api/orders/${id}/status`, { status });
    return response.data;
  },

  // Update order payment status
  updatePaymentStatus: async (id, paymentStatus) => {
    const response = await api.patch(`/api/orders/${id}/payment`, { paymentStatus });
    return response.data;
  },

  // Update order shipping information
  updateShipping: async (id, shippingData) => {
    const response = await api.patch(`/api/orders/${id}/shipping`, shippingData);
    return response.data;
  },

  // Delete an order
  deleteOrder: async (id) => {
    const response = await api.delete(`/api/orders/${id}`);
    return response.data;
  },

  // Get order statistics
  getStatistics: async (params) => {
    const response = await api.get('/api/orders/statistics', { params });
    return response.data;
  },

  // Get recent orders
  getRecentOrders: async (limit = 5) => {
    const response = await api.get('/api/orders/recent', { params: { limit } });
    return response.data;
  }
}; 