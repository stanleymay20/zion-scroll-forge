import { QueryClient } from '@tanstack/react-query';

// Create query client with default options
// Ensure single instance to prevent multiple React issues
let queryClientInstance: QueryClient | null = null;

export const queryClient = queryClientInstance ?? new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

queryClientInstance = queryClient;
