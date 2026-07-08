'use client';
import { useRouter as useNextRouter, usePathname as useNextPathname, useSearchParams as useNextSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function useNavigate() {
    const router = useNextRouter();
    return function navigate(path: string | number, options?: any) {
        if (typeof path === 'number') {
            if (path === -1) router.back();
            return;
        }
        router.push(path);
    };
}

export function useLocation() {
    const pathname = useNextPathname();
    const searchParams = useNextSearchParams();
    return {
        pathname,
        search: searchParams ? `?${searchParams.toString()}` : '',
        state: null
    };
}

export function Navigate({ to, replace }: { to: string, replace?: boolean }) {
    const router = useNextRouter();
    useEffect(() => {
        if (replace) router.replace(to);
        else router.push(to);
    }, [to, replace, router]);
    return null;
}
