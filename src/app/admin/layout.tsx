'use client';
import StandaloneLayout from '@/layouts/StandaloneLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <StandaloneLayout>{children}</StandaloneLayout>;
}
