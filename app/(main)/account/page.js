import { getSession } from '@/lib/auth';
import LogoutButton from '@/components/auth/LogoutButton';
import Link from 'next/link';
import { FaUserCircle, FaCrown, FaChevronRight, FaEdit, FaLock, FaBell, FaShieldAlt } from 'react-icons/fa';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    return (
        <div className="min-h-screen bg-background text-text-main px-4 py-6 max-w-2xl mx-auto pb-24">
            <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>

            {/* Profile Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border border-primary/20 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <FaUserCircle size={48} className="text-primary" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-1">{user.first_name} {user.last_name}</h2>
                        <p className="text-text-secondary text-sm mb-2">{user.email}</p>
                        <div className="inline-flex items-center gap-1.5 bg-white/50 dark:bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary border border-primary/20">
                            <FaCrown size={10} />
                            <span>Plan Gratuito</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Upgrade */}
            <section className="mb-6">
                <div className="bg-gradient-to-br from-primary via-primary-hover to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FaCrown size={20} />
                            <span className="text-lg font-bold">Pasar a Premium</span>
                        </div>
                        <span className="text-2xl font-bold">$149<span className="text-sm font-normal">/mes</span></span>
                    </div>
                    <p className="text-sm opacity-90 mb-4">
                        Actas ilimitadas, citas médicas y más beneficios para el cuidado de tus mascotas.
                    </p>
                    <Link
                        href="/pricing"
                        className="w-full py-3 px-4 rounded-xl bg-white text-primary font-bold text-center block hover:bg-opacity-90 transition-all shadow-md"
                    >
                        Ver Planes
                    </Link>
                </div>
            </section>

            {/* Settings Section */}
            <section className="mb-6">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3 px-1">Configuración</h3>
                <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-gray-200 dark:divide-white/10">
                    <Link
                        href="/account/edit"
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FaEdit className="text-primary" size={16} />
                            </div>
                            <span className="font-medium">Editar Perfil</span>
                        </div>
                        <FaChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={14} />
                    </Link>

                    <Link
                        href="/account/password"
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FaLock className="text-primary" size={16} />
                            </div>
                            <span className="font-medium">Cambiar Contraseña</span>
                        </div>
                        <FaChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={14} />
                    </Link>

                    <Link
                        href="/account/notifications"
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FaBell className="text-primary" size={16} />
                            </div>
                            <span className="font-medium">Notificaciones</span>
                        </div>
                        <FaChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={14} />
                    </Link>

                    <Link
                        href="/account/privacy"
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FaShieldAlt className="text-primary" size={16} />
                            </div>
                            <span className="font-medium">Privacidad</span>
                        </div>
                        <FaChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={14} />
                    </Link>
                </div>
            </section>

            {/* Logout Button */}
            <div className="mb-6">
                <LogoutButton />
            </div>

            {/* Version */}
            <div className="text-center text-xs text-text-secondary">
                Versión 1.0.0
            </div>
        </div>
    );
}
