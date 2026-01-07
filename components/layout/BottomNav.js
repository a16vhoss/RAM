'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaPlusCircle, FaNewspaper, FaUser } from 'react-icons/fa';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path || (path === '/dashboard' && pathname === '/');

    return (
        <nav className="fixed bottom-6 left-5 right-5 h-[72px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 flex justify-around items-center z-50 mx-auto max-w-[560px] rounded-[32px] shadow-2xl shadow-black/20 md:hidden">
            <Link
                href="/dashboard"
                className={`flex flex-col items-center justify-center w-12 h-full transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
                <FaHome size={24} className="mb-0.5" />
                <span className="text-[10px] font-bold">Inicio</span>
            </Link>

            <Link
                href="/directory"
                className={`flex flex-col items-center justify-center w-12 h-full transition-colors ${isActive('/directory') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
                <FaSearch size={22} className="mb-0.5" />
                <span className="text-[10px] font-bold">Buscar</span>
            </Link>

            <div className="relative -top-8 w-16 h-16">
                <Link
                    href="/pets/new"
                    className="w-16 h-16 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-[6px] border-background-light dark:border-background-dark transform transition-transform active:scale-95 text-white"
                >
                    <FaPlusCircle size={30} />
                </Link>
            </div>

            <Link
                href="/blog"
                className={`flex flex-col items-center justify-center w-12 h-full transition-colors ${isActive('/blog') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
                <FaNewspaper size={22} className="mb-0.5" />
                <span className="text-[10px] font-bold">Blog</span>
            </Link>

            <Link
                href="/account"
                className={`flex flex-col items-center justify-center w-12 h-full transition-colors ${isActive('/account') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
                <FaUser size={22} className="mb-0.5" />
                <span className="text-[10px] font-bold">Cuenta</span>
            </Link>
        </nav>
    );
}
