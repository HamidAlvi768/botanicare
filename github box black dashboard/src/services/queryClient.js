import { QueryClient } from '@tanstack/react-query';
import socketService from './socket';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

// Set up WebSocket listeners for real-time updates
export const setupWebSocketListeners = () => {
  // Products
  socketService.on('product:created', () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  socketService.on('product:updated', () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  socketService.on('product:deleted', () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  socketService.on('product:inventory', (data) => {
    queryClient.setQueryData(['products', data.id], (old) => {
      if (!old) return old;
      return { ...old, inventory: data.inventory };
    });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  // Orders
  socketService.on('order:created', () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  socketService.on('order:updated', () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  socketService.on('order:status', (data) => {
    queryClient.setQueryData(['orders', data.id], (old) => {
      if (!old) return old;
      return { ...old, status: data.status };
    });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  socketService.on('order:payment', (data) => {
    queryClient.setQueryData(['orders', data.id], (old) => {
      if (!old) return old;
      return { ...old, paymentStatus: data.paymentStatus };
    });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  // Categories
  socketService.on('category:created', () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  });

  socketService.on('category:updated', () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  });

  socketService.on('category:deleted', () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  });

  // Users
  socketService.on('user:created', () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  socketService.on('user:updated', () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });

  socketService.on('user:deleted', () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  });
};

export default queryClient; 