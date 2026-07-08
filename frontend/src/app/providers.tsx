'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 1000,
                gcTime: 5 * 60 * 1000,
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1d1b16',
                            color: '#f0ecdf',
                            border: '1px solid #575242',
                        },
                    }}
                />
            </AuthProvider>
        </QueryClientProvider>
    );
}
