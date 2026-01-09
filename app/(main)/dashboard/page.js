import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { FaPlus, FaBell, FaIdCard, FaStethoscope, FaSyringe, FaExclamationTriangle, FaSearch, FaLightbulb, FaNewspaper } from 'react-icons/fa';
import { redirect } from 'next/navigation';
import DashboardSearch from './DashboardSearch';
import NotificationsBell from '@/app/components/NotificationsBell';
import JoinFamilyButton from '@/app/components/JoinFamilyButton';

import Image from 'next/image';
import SpeciesIcon from '@/app/components/SpeciesIcon';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    // Fetch Pets (owned or co-owned)
    const pets = await db.getAll(`
        SELECT pets.* 
        FROM pets 
        JOIN pet_owners ON pets.pet_id = pet_owners.pet_id 
        WHERE pet_owners.user_id = $1
    `, [user.user_id]);

    // Fetch Daily Tip
    const dailyTip = await db.getOne(`
        SELECT content FROM daily_tips WHERE display_date = CURRENT_DATE
    `);
    const tipContent = dailyTip?.content || "La hidratación es clave. Cambia el agua de tu mascota 3 veces al día.";

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-28 overflow-x-hidden">
            {/* Header Section */}
            <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-lg pt-6 pb-4 px-6 animate-slide-up">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Bienvenido</span>
                            <h1 className="text-xl font-display font-bold text-white leading-tight">{user.first_name || 'Usuario'}</h1>
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
                                <p className="text-white font-bold text-lg leading-tight">Registro RAM</p>
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



                        {/* Lost Pets Directory */}
                        <Link href="/alertas" className="group relative h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-red-500 to-rose-600 p-5 flex flex-col justify-between shadow-lg hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95">
                            <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2 group-hover:rotate-12 transition-transform">
                                <FaSearch size={90} className="text-white" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <FaSearch className="text-white text-xl" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-white font-bold text-lg leading-tight">Alertas</p>
                                <p className="text-red-100 text-xs mt-1 font-medium">Mascotas perdidas</p>
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
                                <p className="text-white font-bold text-lg leading-tight">Alerta RAM</p>
                                <p className="text-amber-100 text-xs mt-1 font-medium">Reportar extravío</p>
                            </div>
                        </Link>

                        {/* Blog */}
                        <Link href="/blog" className="group relative h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 to-purple-600 p-5 flex flex-col justify-between shadow-lg hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95">
                            <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2 group-hover:rotate-12 transition-transform">
                                <FaNewspaper size={90} className="text-white" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <FaNewspaper className="text-white text-xl" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-white font-bold text-lg leading-tight">Blog</p>
                                <p className="text-purple-100 text-xs mt-1 font-medium">Tips y Noticias</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Tip Banner */}
                <section className="px-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="relative w-full rounded-3xl overflow-hidden h-32 flex items-center justify-between p-6 bg-surface-dark border border-white/5 shadow-lg group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
                        <div className="relative z-10 max-w-[70%]">
                            <span className="inline-block px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm text-[10px] font-bold text-white mb-2 uppercase tracking-wide border border-white/10">
                                Tip del día
                            </span>
                            <p className="text-white font-bold text-sm leading-snug">{tipContent}</p>
                        </div>
                        <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform group-hover:rotate-12">
                            <FaLightbulb size={32} className="text-yellow-300 drop-shadow-lg" />
                        </div>
                    </div>
                </section>

                {/* Pets Carousel */}
                <section className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="flex justify-between items-center px-5">
                        <h2 className="text-lg font-bold text-text-main dark:text-white">Tus Mascotas</h2>
                        <div className="flex items-center gap-3">
                            <JoinFamilyButton />
                            <Link href="/pets/new" className="w-8 h-8 rounded-full bg-surface-dark hover:bg-primary transition-colors flex items-center justify-center text-white border border-white/10" title="Nueva Mascota">
                                <FaPlus size={12} />
                            </Link>
                        </div>
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
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                        {pet.pet_photo && !pet.pet_photo.includes('/api/placeholder') ? (
                                            <Image
                                                src={pet.pet_photo}
                                                alt={pet.pet_name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="160px"
                                            />
                                        ) : (
                                            <SpeciesIcon species={pet.species} className="text-white/20 group-hover:text-white/40 transition-colors" size={80} />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                                    <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col items-start gap-1 z-10">
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
