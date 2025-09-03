import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashbookApi, Exception } from '~/lib/api';
import type { CreateCashbookRequest, UpdateCashbookRequest } from '~/lib/api';

export const useCashbooks = () => {
  const queryClient = useQueryClient();

  // Get all cashbooks
  const {
    data: cashbooks = [],
    isLoading: isLoadingCashbooks,
    error: cashbooksError,
  } = useQuery({
    queryKey: ['cashbooks'],
    queryFn: async () => {
      try {
        const response = await cashbookApi.getAllCashbooks();
        console.log('Cashbooks API response:', response);

        // Handle different possible response structures
        let cashbooksData: unknown[] = [];

        if (response.data) {
          if (Array.isArray(response.data)) {
            cashbooksData = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            const dataObj = response.data as Record<string, unknown>;
            if (dataObj.cashbooks && Array.isArray(dataObj.cashbooks)) {
              cashbooksData = dataObj.cashbooks;
            } else if (dataObj.data && Array.isArray(dataObj.data)) {
              cashbooksData = dataObj.data;
            } else {
              console.warn('Unexpected API response structure:', response.data);
            }
          } else {
            console.warn('Unexpected API response structure:', response.data);
          }
        }

        // Ensure all items have required properties
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cashbooksData.map((item: any) => {
          return {
            cashbook_id: (item.cashbook_id as number) || (item.id as number) || 0,
            user_id: (item.user_id as number) || 0,
            name: (item.name as string) || 'Unnamed Cashbook',
            description: (item.description as string) || '',
            initial_balance: (item.initial_balance as number) || 0,
            current_balance: (item.current_balance as number) || (item.balance as number) || 0,
            is_active: item.is_active !== undefined ? (item.is_active as boolean) : true,
            created_at: (item.created_at as string) || new Date().toISOString(),
            updated_at: (item.updated_at as string) || new Date().toISOString(),
          };
        });
      } catch (error) {
        console.error('Error fetching cashbooks:', error);
        return [];
      }
    },
  });

  // Create cashbook mutation
  const createCashbookMutation = useMutation({
    mutationFn: async (data: CreateCashbookRequest) => {
      const response = await cashbookApi.createCashbook(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch cashbooks
      queryClient.invalidateQueries({ queryKey: ['cashbooks'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to create cashbook:', error);
    },
  });

  // Update cashbook mutation
  const updateCashbookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCashbookRequest }) => {
      const response = await cashbookApi.updateCashbook(id, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch cashbooks
      queryClient.invalidateQueries({ queryKey: ['cashbooks'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to update cashbook:', error);
    },
  });

  // Delete cashbook mutation
  const deleteCashbookMutation = useMutation({
    mutationFn: async (id: number) => {
      await cashbookApi.deleteCashbook(id);
    },
    onSuccess: () => {
      // Invalidate and refetch cashbooks
      queryClient.invalidateQueries({ queryKey: ['cashbooks'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to delete cashbook:', error);
    },
  });

  return {
    // Data
    cashbooks,
    isLoadingCashbooks,
    cashbooksError,

    // Mutations
    createCashbook: createCashbookMutation.mutate,
    createCashbookMutation,
    updateCashbook: updateCashbookMutation.mutate,
    updateCashbookMutation,
    deleteCashbook: deleteCashbookMutation.mutate,
    deleteCashbookMutation,
  };
};
