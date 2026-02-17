import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaShieldAlt, FaFlag, FaHome, FaSignOutAlt } from 'react-icons/fa';

export default async function AdminLayout({ children }) {
    const session = await getSession();

    if (!session || !session.user) {
        redirect('/login');
    }

    // Verify admin role
    const user = await db.getOne('SELECT role FROM users WHERE user_id = $1', [session.user.user_id]);

    if (user?.role !== 'admin') {
        redirect('/dashboard'); // Kick non-admins out
    }

    return (
        <div className="min-h-screen bg-green-950 text-white flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-green-900 border-r border-white/5 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                            <FaShieldAlt size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">RAM Admin</h1>
                            <p className="text-xs text-slate-400">Panel de Control</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin/reports" className="flex items-center gap-3 px-4 py-3 bg-white/5 text-white rounded-xl font-medium">
                        <FaFlag className="text-red-400" />
                        Reportes
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium">
                        <FaHome />
                        Volver a la App
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-500 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                            {session.user.first_name?.[0] || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate font-medium text-slate-300">{session.user.first_name}</p>
                            <p className="truncate text-xs">Administrador</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
