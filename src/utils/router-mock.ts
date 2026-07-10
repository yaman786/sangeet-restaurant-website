'use client';
import { useRouter as useNextRouter, usePathname as useNextPathname, useSearchParams as useNextSearchParams } from 'next/navigation';
import { useEffect, useCallback, useRef } from 'react';

export function useNavigate() {
    const router = useNextRouter();
    const routerRef = useRef(router);
    
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    return useCallback(function navigate(path: string | number, options?: any) {
        if (typeof path === 'number') {
            if (path === -1) routerRef.current.back();
            return;
        }
        routerRef.current.push(path as string);
    }, []);
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
