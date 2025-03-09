import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoriesService } from '../services/categories';

export const useCategories = (params) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => CategoriesService.getCategories(params)
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => CategoriesService.getCategory(id),
    enabled: !!id
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => CategoriesService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => CategoriesService.updateCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', id] });
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => CategoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};

export const useCategoryStatistics = () => {
  return useQuery({
    queryKey: ['categories', 'statistics'],
    queryFn: () => CategoriesService.getStatistics()
  });
}; 