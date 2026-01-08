'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaPlusCircle, FaUsers, FaUser, FaNewspaper } from 'react-icons/fa';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path || (path === '/dashboard' && pathname === '/');

    const [showMenu, setShowMenu] = useState(false);

    return (
        <>
            {/* Quick Actions Menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in md:hidden"
                    onClick={() => setShowMenu(false)}
                >
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center">
                        <Link
                            href="/pets/new"
                            onClick={() => setShowMenu(false)}
                            className="flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-full shadow-xl font-bold transform transition-transform hover:scale-105 active:scale-95 animate-slide-up"
                            style={{ animationDelay: '0ms' }}
                        >
                            <FaPlusCircle className="text-primary text-xl" />
                            <span>Registrar Mascota</span>
                        </Link>
                        <Link
                            href="/blog"
                            onClick={() => setShowMenu(false)}
                            className="flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-full shadow-xl font-bold transform transition-transform hover:scale-105 active:scale-95 animate-slide-up"
                            style={{ animationDelay: '50ms' }}
                        >
                            <FaNewspaper className="text-blue-500 text-xl" />
                            <span>Ver Blog</span>
                        </Link>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-6 left-5 right-5 h-[72px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 flex justify-around items-center z-50 mx-auto max-w-[560px] rounded-[32px] shadow-2xl shadow-black/20 md:hidden print:hidden">
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
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-[6px] border-background-light dark:border-background-dark transform transition-all active:scale-95 text-white ${showMenu ? 'bg-slate-800 rotate-45' : 'bg-gradient-to-br from-primary to-blue-700'}`}
                    >
                        <FaPlusCircle size={30} />
                    </button>
                </div>

                <Link
                    href="/communities"
                    className={`flex flex-col items-center justify-center w-12 h-full transition-colors ${pathname.startsWith('/communities') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    <FaUsers size={22} className="mb-0.5" />
                    <span className="text-[10px] font-bold">Social</span>
                </Link>

                <Link
                    href="/account"
                    className={`flex flex-col items-center justify-center w-12 h-full transition-colors ${isActive('/account') ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    <FaUser size={22} className="mb-0.5" />
                    <span className="text-[10px] font-bold">Cuenta</span>
                </Link>
            </nav>
        </>
    );
}
