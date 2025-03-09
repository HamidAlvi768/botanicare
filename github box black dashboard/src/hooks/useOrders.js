import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrdersService } from '../services/orders';

export const useOrders = (params) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => OrdersService.getOrders(params)
  });
};

export const useOrder = (id) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => OrdersService.getOrder(id),
    enabled: !!id
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => OrdersService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    }
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => OrdersService.updateOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    }
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => OrdersService.updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
    }
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => OrdersService.updatePaymentStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    }
  });
};

export const useUpdateShipping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, shippingData }) => OrdersService.updateShipping(id, shippingData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
    onError: (error) => {
      console.error('Error updating shipping:', error);
      // You might want to handle this error in the UI
    }
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => OrdersService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    }
  });
};

export const useOrderStatistics = () => {
  return useQuery({
    queryKey: ['orders', 'statistics'],
    queryFn: () => OrdersService.getStatistics()
  });
};

export const useRecentOrders = (limit) => {
  return useQuery({
    queryKey: ['orders', 'recent', limit],
    queryFn: () => OrdersService.getRecentOrders(limit)
  });
}; 