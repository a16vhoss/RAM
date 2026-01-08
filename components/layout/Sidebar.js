'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaPlusCircle, FaNewspaper, FaUser, FaPaw, FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';
import { logoutUser } from '@/app/actions/user';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path || (path === '/dashboard' && pathname === '/');

    const menuItems = [
        { name: 'Inicio', path: '/dashboard', icon: <FaHome size={20} /> },
        { name: 'Buscar', path: '/directory', icon: <FaSearch size={20} /> },
        { name: 'Alertas', path: '/alertas', icon: <FaExclamationTriangle size={20} /> },
        { name: 'Blog', path: '/blog', icon: <FaNewspaper size={20} /> },
        { name: 'Cuenta', path: '/account', icon: <FaUser size={20} /> },
    ];

    return (
        <aside className="fixed top-0 left-0 w-64 h-full bg-slate-900 border-r border-white/5 hidden md:flex flex-col z-50 print:hidden">
            {/* Logo Area */}
            <div className="p-8 pb-4">
                <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                        <FaPaw className="text-white text-lg" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">RAM</h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Registro Animal</p>
                    </div>
                </Link>

                {/* Main Action */}
                <Link
                    href="/pets/new"
                    className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center gap-3 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm mb-6"
                >
                    <FaPlusCircle size={18} />
                    Registrar Mascota
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 px-4 overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm ${isActive(item.path)
                                ? 'bg-primary/10 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={isActive(item.path) ? 'text-primary' : ''}>{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-white/5 mx-4 mb-4">
                <button
                    onClick={() => logoutUser()}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                    <FaSignOutAlt />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
