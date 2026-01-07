import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { FaPlus, FaBell, FaIdCard, FaStethoscope, FaSyringe, FaExclamationTriangle } from 'react-icons/fa';
import { redirect } from 'next/navigation';
import DashboardSearch from './DashboardSearch';
import NotificationsBell from '@/app/components/NotificationsBell';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    // Fetch Pets
    const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [user.user_id]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-28 overflow-x-hidden">
            {/* Header Section */}
            <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-lg pt-6 pb-4 px-6 animate-slide-up">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative group cursor-pointer">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary transition-colors">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'User')}&background=random`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-slate-900"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Bienvenido</span>
                                <h1 className="text-xl font-display font-bold text-white leading-tight">{user.first_name || 'Usuario'}</h1>
                            </div>
                        </div>
                        <NotificationsBell />
                    </div>
                    <p className="text-2xl font-bold text-white leading-tight mt-2">
                        Tus peludos están <br />
                        <span className="text-primary bg-clip-text">protegidos y seguros.</span>
                    </p>
                </div>
            </header>


            <main className="flex flex-col gap-8 w-full mt-6 max-w-7xl mx-auto">
                {/* Search Bar */}
                <div className="px-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <DashboardSearch />
                </div>

                {/* Quick Actions Grid */}
                <section className="px-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-text-main dark:text-white">Acciones Rápidas</h2>
                        <Link href="/documents" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">Ver todo</Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* RUAC */}
                        <Link href="/documents" className="group relative h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 p-5 flex flex-col justify-between shadow-lg hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95">
                            <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2 group-hover:rotate-12 transition-transform">
                                <FaIdCard size={90} className="text-white" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <FaIdCard className="text-white text-xl" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-white font-bold text-lg leading-tight">Registro RUAC</p>
                                <p className="text-blue-200 text-xs mt-1 font-medium">Identificación oficial</p>
                            </div>
                        </Link>

                        {/* Vets */}
                        <Link href="/directory" className="group relative h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 p-5 flex flex-col justify-between shadow-lg hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95">
                            <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2 group-hover:rotate-12 transition-transform">
                                <FaStethoscope size={90} className="text-white" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <FaStethoscope className="text-white text-xl" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-white font-bold text-lg leading-tight">Veterinarios</p>
                                <p className="text-emerald-100 text-xs mt-1 font-medium">Directorio cercano</p>
                            </div>
                        </Link>

                        {/* Cartilla */}
                        <Link href="/documents" className="group relative h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 p-5 flex flex-col justify-between shadow-lg hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95">
                            <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2 group-hover:rotate-12 transition-transform">
                                <FaSyringe size={90} className="text-white" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <FaSyringe className="text-white text-xl" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-white font-bold text-lg leading-tight">Cartilla Digital</p>
                                <p className="text-violet-200 text-xs mt-1 font-medium">Vacunas y citas</p>
                            </div>
                        </Link>

                        {/* Amber Alert */}
                        <Link href="/amber-alert" className="group relative h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-5 flex flex-col justify-between shadow-lg hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95">
                            <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2 group-hover:rotate-12 transition-transform">
                                <FaExclamationTriangle size={90} className="text-white" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <FaExclamationTriangle className="text-white text-xl" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-white font-bold text-lg leading-tight">Alerta Amber</p>
                                <p className="text-amber-100 text-xs mt-1 font-medium">Reportar extravío</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Tip Banner */}
                <section className="px-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="relative w-full rounded-3xl overflow-hidden h-32 flex items-center justify-between p-6 bg-surface-dark border border-white/5 shadow-lg group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
                        <div className="relative z-10 max-w-[65%]">
                            <span className="inline-block px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm text-[10px] font-bold text-white mb-2 uppercase tracking-wide border border-white/10">
                                Tip del día
                            </span>
                            <p className="text-white font-bold text-sm leading-snug">La hidratación es clave. Cambia el agua de Max 3 veces al día.</p>
                        </div>
                        <div className="relative z-10 w-20 h-20 rounded-full border-4 border-white/20 overflow-hidden shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8C8auowYV8uJJuZgzvEXrnh8b4hBUpQJb3yn_J4u6ZVhM_loZU7UemBwnuxwFW12hyCE1iKnIbHu1bRVgxENNo5Ia7MyepghWmOabsDyY5NigXOVzQI2G9_eFTsU9X0FaR9JWyDwfHcBiXy3YmWc4hh7Ox-u7mp0FRNOFXQ78nqggVGVX6nRqRdYQljAnsETQQfUJrjphHqHZxgQmibIsQ5mkIy_aElAF3FgPx-BGDTtELL5XMnzg8Gvv8zaKNpmt3YOaNPOH9CTU" alt="Tip" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </section>

                {/* Pets Carousel */}
                <section className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="flex justify-between items-center px-5">
                        <h2 className="text-lg font-bold text-text-main dark:text-white">Tus Mascotas</h2>
                        <Link href="/pets/new" className="w-8 h-8 rounded-full bg-surface-dark hover:bg-primary transition-colors flex items-center justify-center text-white border border-white/10">
                            <FaPlus size={12} />
                        </Link>
                    </div>

                    <div className="no-scrollbar flex overflow-x-auto gap-4 px-5 pb-4 snap-x snap-mandatory">
                        {pets.length === 0 ? (
                            <div className="min-w-[160px] h-[220px] rounded-3xl bg-surface-light dark:bg-surface-dark flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-white/10 text-text-secondary">
                                <p className="text-sm font-medium">Sin mascotas</p>
                            </div>
                        ) : (
                            pets.map(pet => (
                                <Link
                                    href={`/pets/${pet.pet_id}`}
                                    key={pet.pet_id}
                                    className="snap-center group min-w-[160px] h-[220px] rounded-3xl overflow-hidden relative shadow-lg hover:shadow-glow transition-all hover:-translate-y-1"
                                >
                                    <div className="absolute inset-0">
                                        <img
                                            src={pet.pet_photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"}
                                            alt={pet.pet_name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                                    <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-green-500/30 mb-1">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-green-100 uppercase tracking-wide">Al día</span>
                                        </div>
                                        <p className="text-white font-bold text-xl leading-none">{pet.pet_name}</p>
                                        <p className="text-gray-300 text-xs font-medium">{pet.breed || pet.species}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                        {/* Spacer */}
                        <div className="min-w-[20px] snap-center"></div>
                    </div>
                </section>

                {/* Space for Bottom Nav */}
                <div className="h-8"></div>
            </main>
        </div >
    );
}
