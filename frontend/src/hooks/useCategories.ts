import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi, Exception } from '~/lib/api';
import type { CreateCategoryRequest, UpdateCategoryRequest, AssignCategoryRequest } from '~/lib/api';

export const useCategories = () => {
  const queryClient = useQueryClient();

  // Get all categories for the authenticated user
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await categoryApi.getAllCategories();
        console.log('Categories API response:', response);

        // Handle different possible response structures
        let categoriesData: unknown[] = [];

        if (response.data) {
          if (Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            const dataObj = response.data as Record<string, unknown>;
            if (dataObj.categories && Array.isArray(dataObj.categories)) {
              categoriesData = dataObj.categories;
            } else if (dataObj.data && Array.isArray(dataObj.data)) {
              categoriesData = dataObj.data;
            } else {
              console.warn('Unexpected API response structure:', response.data);
            }
          } else {
            console.warn('Unexpected API response structure:', response.data);
          }
        }

        // Ensure all items have required properties
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return categoriesData.map((item: any) => {
          return {
            category_id: (item.category_id as number) || (item.id as number) || 0,
            user_id: (item.user_id as number) || 0,
            name: (item.name as string) || 'Unnamed Category',
            type: (item.type as 'income' | 'expense') || 'expense',
            created_at: (item.created_at as string) || new Date().toISOString(),
            updated_at: (item.updated_at as string) || new Date().toISOString(),
          };
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const response = await categoryApi.createCategory(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to create category:', error);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCategoryRequest }) => {
      const response = await categoryApi.updateCategory(id, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to update category:', error);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await categoryApi.deleteCategory(id);
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to delete category:', error);
    },
  });

  // Get category statistics
  const {
    data: categoryStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['categoryStats'],
    queryFn: async () => {
      try {
        const response = await categoryApi.getCategoryStats();
        return response.data;
      } catch (error) {
        console.error('Error fetching category stats:', error);
        return null;
      }
    },
  });

  // Assign category to transaction mutation
  const assignCategoryMutation = useMutation({
    mutationFn: async (data: AssignCategoryRequest) => {
      await categoryApi.assignCategoryToTransaction(data);
    },
    onSuccess: () => {
      // Invalidate and refetch categories and transactions
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to assign category:', error);
    },
  });

  // Remove category from transaction mutation
  const removeCategoryMutation = useMutation({
    mutationFn: async ({ transactionId, categoryId }: { transactionId: number; categoryId: number }) => {
      await categoryApi.removeCategoryFromTransaction(transactionId, categoryId);
    },
    onSuccess: () => {
      // Invalidate and refetch categories and transactions
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to remove category:', error);
    },
  });

  return {
    // Data
    categories,
    isLoadingCategories,
    categoriesError,
    categoryStats,
    isLoadingStats,
    statsError,

    // Mutations
    createCategory: createCategoryMutation.mutate,
    createCategoryMutation,
    updateCategory: updateCategoryMutation.mutate,
    updateCategoryMutation,
    deleteCategory: deleteCategoryMutation.mutate,
    deleteCategoryAsync: deleteCategoryMutation.mutateAsync,
    deleteCategoryMutation,
    assignCategoryToTransaction: assignCategoryMutation.mutate,
    assignCategoryMutation,
    removeCategoryFromTransaction: removeCategoryMutation.mutate,
    removeCategoryMutation,
  };
};
