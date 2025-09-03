import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | null = null;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    browserQueryClient = browserQueryClient ?? makeQueryClient();
    return browserQueryClient;
  }

}