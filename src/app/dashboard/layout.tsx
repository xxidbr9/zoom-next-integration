"use client";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import React from 'react';
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient()

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </TooltipProvider>
  )
}
