// Fetch utility for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T = unknown> {
  status: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Cashbook interfaces
interface Cashbook {
  cashbook_id: number;
  user_id: number;
  name: string;
  description?: string;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateCashbookRequest {
  name: string;
  description?: string;
  initial_balance?: number;
}

interface UpdateCashbookRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

interface CashbookBalance {
  cashbook_id: number;
  initial_balance: number;
  current_balance: number;
  total_income: number;
  total_expenses: number;
}

// Transaction interfaces
interface Transaction {
  transaction_id: number;
  user_id: number;
  cashbook_id: number;
  type: 'income' | 'expense';
  amount: number;
  source_person: string;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  categories?: Category[];
}

interface CreateTransactionRequest {
  cashbook_id: number;
  type: 'income' | 'expense';
  amount: number;
  source_person: string;
  description?: string;
  transaction_date: string;
  category_ids?: number[];
}

interface UpdateTransactionRequest {
  type?: 'income' | 'expense';
  amount?: number;
  source_person?: string;
  description?: string;
  transaction_date?: string;
  category_ids?: number[];
}

interface TransactionStatsData {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
  income_count: number;
  expense_count: number;
}

interface TransactionStats {
  stats: TransactionStatsData;
}

// Category interfaces
interface Category {
  category_id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
}

interface UpdateCategoryRequest {
  name?: string;
  type?: 'income' | 'expense';
}

interface CategoryStats {
  total_categories: number;
  income_categories: number;
  expense_categories: number;
  categories_with_transactions: number;
  most_used_categories: Array<{
    category_id: number;
    name: string;
    type: 'income' | 'expense';
    transaction_count: number;
    total_amount: number;
  }>;
}

interface AssignCategoryRequest {
  transaction_id: number;
  category_id: number;
}

class Exception extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'Exception';
  }
}

// Generic fetch function
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Exception(
        data.message || data.error || 'Something went wrong',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Exception) {
      throw error;
    }

    // Network error or other issues
    throw new Exception(
      'Network error. Please check your connection.',
      0,
      error
    );
  }
}

// Auth API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log({ response });

    if (response.status && response.data) {
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    }

    throw new Exception(response.message || 'Login failed', 400);
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.status && response.data) {
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    }

    throw new Exception(response.message || 'Registration failed', 400);
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await fetchApi('/api/users/logout', {
        method: 'POST',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.warn('Logout API call failed, but clearing local storage');
    } finally {
      // Always clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await fetchApi<AuthResponse['user']>('/api/users/me');

    if (response.status && response.data) {
      return response.data;
    }

    throw new Exception(response.message || 'Failed to get user data', 401);
  },
};

// Generic API functions for other endpoints
export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),

  post: <T>(endpoint: string, data: unknown) => fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  put: <T>(endpoint: string, data: unknown) => fetchApi<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, {
    method: 'DELETE',
  }),
};

// Cashbook API functions
export const cashbookApi = {
  // Get all cashbooks for the authenticated user
  getAllCashbooks: () => fetchApi<Cashbook[]>('/api/cashbooks'),

  // Create a new cashbook
  createCashbook: (data: CreateCashbookRequest) =>
    fetchApi<Cashbook>('/api/cashbooks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get a specific cashbook
  getCashbook: (id: number) => fetchApi<Cashbook>(`/api/cashbooks/${id}`),

  // Get cashbook balance with calculations
  getCashbookBalance: (id: number) => fetchApi<CashbookBalance>(`/api/cashbooks/${id}/balance`),

  // Update a cashbook
  updateCashbook: (id: number, data: UpdateCashbookRequest) =>
    fetchApi<Cashbook>(`/api/cashbooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete a cashbook
  deleteCashbook: (id: number) =>
    fetchApi<void>(`/api/cashbooks/${id}`, {
      method: 'DELETE',
    }),
};

// Transaction API functions
export const transactionApi = {
  // Get all transactions for the authenticated user
  getAllTransactions: () => fetchApi<Transaction[]>('/api/transactions'),

  // Get transaction statistics
  getTransactionStats: () => fetchApi<TransactionStats>('/api/transactions/stats'),

  // Create a new transaction
  createTransaction: (data: CreateTransactionRequest) =>
    fetchApi<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get a specific transaction
  getTransaction: (id: number) => fetchApi<Transaction>(`/api/transactions/${id}`),

  // Update a transaction
  updateTransaction: (id: number, data: UpdateTransactionRequest) =>
    fetchApi<Transaction>(`/api/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete a transaction
  deleteTransaction: (id: number) =>
    fetchApi<void>(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),
};

// Category API functions
export const categoryApi = {
  // Get all categories for the authenticated user
  getAllCategories: () => fetchApi<Category[]>('/api/categories'),

  // Get category statistics
  getCategoryStats: () => fetchApi<CategoryStats>('/api/categories/stats'),

  // Create a new category
  createCategory: (data: CreateCategoryRequest) =>
    fetchApi<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get a specific category
  getCategory: (id: number) => fetchApi<Category>(`/api/categories/${id}`),

  // Update a category
  updateCategory: (id: number, data: UpdateCategoryRequest) =>
    fetchApi<Category>(`/api/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete a category
  deleteCategory: (id: number) =>
    fetchApi<void>(`/api/categories/${id}`, {
      method: 'DELETE',
    }),

  // Assign category to transaction
  assignCategoryToTransaction: (data: AssignCategoryRequest) =>
    fetchApi<void>('/api/categories/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Remove category from transaction
  removeCategoryFromTransaction: (transactionId: number, categoryId: number) =>
    fetchApi<void>(`/api/categories/${transactionId}/${categoryId}`, {
      method: 'DELETE',
    }),
};

export { Exception };
export type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Cashbook,
  CreateCashbookRequest,
  UpdateCashbookRequest,
  CashbookBalance,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionStats,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryStats,
  AssignCategoryRequest,
};
