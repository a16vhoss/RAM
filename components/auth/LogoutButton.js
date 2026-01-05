'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-xl border-2 border-error text-error bg-white dark:bg-surface-dark font-semibold hover:bg-error hover:text-white transition-all"
        >
            Cerrar Sesión
        </button>
    );
}
