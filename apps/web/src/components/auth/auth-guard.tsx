'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/app-store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthenticated = useAppStore((state) => state.isAuthenticated);
    const accessToken = useAppStore((state) => state.accessToken);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Check if user is authenticated or has a token in storage
        const token = accessToken || localStorage.getItem('accessToken');

        // Public paths that don't require auth
        const publicPaths = ['/', '/login', '/register', '/forgot-password', '/demo'];

        if (!token && !publicPaths.includes(pathname)) {
            setAuthorized(false);
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [isAuthenticated, accessToken, router, pathname]);

    // Show nothing while checking (or a loading spinner)
    // If verifying, we might want to return null.
    // But if it's a public path, we render children.
    const publicPaths = ['/', '/login', '/register', '/forgot-password', '/demo'];
    if (publicPaths.includes(pathname)) {
        return <>{children}</>;
    }

    return authorized ? <>{children}</> : null;
}
