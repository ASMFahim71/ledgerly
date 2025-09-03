import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi, Exception } from '~/lib/api';
import type { CreateTransactionRequest, UpdateTransactionRequest } from '~/lib/api';

export const useTransactions = (cashbookId?: number) => {
  const queryClient = useQueryClient();

  // Get all transactions (optionally filtered by cashbook)
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useQuery({
    queryKey: ['transactions', cashbookId],
    queryFn: async () => {
      try {
        const response = await transactionApi.getAllTransactions();
        console.log('Transactions API response:', response);

        // Handle different possible response structures
        let transactionsData: unknown[] = [];

        if (response.data) {
          if (Array.isArray(response.data)) {
            transactionsData = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            const dataObj = response.data as Record<string, unknown>;
            if (dataObj.transactions && Array.isArray(dataObj.transactions)) {
              transactionsData = dataObj.transactions;
            } else if (dataObj.data && Array.isArray(dataObj.data)) {
              transactionsData = dataObj.data;
            } else {
              console.warn('Unexpected API response structure:', response.data);
            }
          } else {
            console.warn('Unexpected API response structure:', response.data);
          }
        }

        // Ensure all items have required properties
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedTransactions = transactionsData.map((item: any) => {
          // Parse categories if it's a JSON string
          let categories = [];
          try {
            if (typeof item.categories === 'string') {
              categories = JSON.parse(item.categories);
            } else if (Array.isArray(item.categories)) {
              categories = item.categories;
            }
            // Filter out null category entries (from JSON_ARRAYAGG when no categories)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            categories = categories.filter((cat: any) => cat && cat.category_id);
          } catch (e) {
            console.warn('Error parsing categories:', e);
          }

          return {
            transaction_id: (item.transaction_id as number) || (item.id as number) || 0,
            user_id: (item.user_id as number) || 0,
            cashbook_id: (item.cashbook_id as number) || 0,
            type: (item.type as 'income' | 'expense') || 'expense',
            amount: (item.amount as number) || 0,
            source_person: (item.source_person as string) || 'Unknown',
            description: (item.description as string) || '',
            transaction_date: (item.transaction_date as string) || new Date().toISOString().split('T')[0],
            created_at: (item.created_at as string) || new Date().toISOString(),
            updated_at: (item.updated_at as string) || new Date().toISOString(),
            categories: categories,
          };
        });

        // Filter by cashbook if specified
        if (cashbookId) {
          return processedTransactions.filter(t => t.cashbook_id === cashbookId);
        }

        return processedTransactions;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    },
  });

  // Get transaction statistics
  const {
    data: transactionStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['transaction-stats', cashbookId],
    queryFn: async () => {
      try {
        const response = await transactionApi.getTransactionStats();
        return response.data;
      } catch (error) {
        console.error('Error fetching transaction stats:', error);
        return null;
      }
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: CreateTransactionRequest) => {
      const response = await transactionApi.createTransaction(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cashbooks'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to create transaction:', error);
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTransactionRequest }) => {
      const response = await transactionApi.updateTransaction(id, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cashbooks'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to update transaction:', error);
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      await transactionApi.deleteTransaction(id);
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cashbooks'] });
    },
    onError: (error: Exception) => {
      console.error('Failed to delete transaction:', error);
    },
  });

  return {
    // Data
    transactions,
    isLoadingTransactions,
    transactionsError,
    transactionStats,
    isLoadingStats,
    statsError,

    // Mutations
    createTransaction: createTransactionMutation.mutate,
    createTransactionMutation,
    updateTransaction: updateTransactionMutation.mutate,
    updateTransactionMutation,
    deleteTransaction: deleteTransactionMutation.mutate,
    deleteTransactionMutation,
  };
};
