'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, Exception } from '~/lib/api';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
};

// Custom hook for authentication
export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: authKeys.user,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user, data.user);
      router.push('/dashboard'); // Redirect to dashboard after login
    },
    onError: (error: Exception) => {
      console.error('Login error:', error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user, data.user);
      router.push('/dashboard'); // Redirect to dashboard after registration
    },
    onError: (error: Exception) => {
      console.error('Registration error:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.user });
      router.push('/'); // Redirect to home after logout
    },
    onError: (error: Exception) => {
      console.error('Logout error:', error);
      // Even if logout fails, clear the cache and redirect
      queryClient.removeQueries({ queryKey: authKeys.user });
      router.push('/');
    },
  });

  const isAuthenticated = !!user;

  return {
    user,
    isLoadingUser,
    isAuthenticated,
    login: loginMutation.mutate,
    loginMutation,
    register: registerMutation.mutate,
    registerMutation,
    logout: logoutMutation.mutate,
    logoutMutation,
  };
};
