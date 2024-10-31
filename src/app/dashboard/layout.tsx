"use client";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import React from 'react';
import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient()

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
