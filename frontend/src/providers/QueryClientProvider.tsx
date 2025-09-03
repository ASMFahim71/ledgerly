'use client';

import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "~/lib/queryClient";

export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  return <TanstackQueryClientProvider client={getQueryClient()}>{children}</TanstackQueryClientProvider>;
};
