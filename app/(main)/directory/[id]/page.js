import db from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowLeft, FaHeart, FaStar, FaPhone, FaWhatsapp, FaMapMarkedAlt, FaSyringe, FaBriefcaseMedical, FaCut, FaFirstAid, FaInfoCircle, FaClock, FaCalendarAlt, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';

export default async function ProviderPage({ params }) {
    const { id } = await params;

    const provider = await db.getOne('SELECT * FROM providers WHERE provider_id = $1', [id]);

    if (!provider) {
        notFound();
    }

    const specialities = JSON.parse(provider.specialties || '[]');
    const schedule = JSON.parse(provider.schedule || '{}');

    // Helper to map specialties to icons
    const getIconForSpecialty = (spec) => {
        const s = spec.toLowerCase();
        if (s.includes('vacuna')) return <FaSyringe size={20} />;
        if (s.includes('cirug')) return <FaBriefcaseMedical size={20} />;
        if (s.includes('est')) return <FaCut size={20} />;
        return <FaFirstAid size={20} />;
    };

    const getThemeForSpecialty = (spec) => {
        const s = spec.toLowerCase();
        if (s.includes('vacuna')) return { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-[#2791e7]' };
        if (s.includes('cirug')) return { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-500' };
        if (s.includes('est')) return { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-500' };
        return { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-500' };
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col pb-24 bg-[#f6f7f8] dark:bg-[#111a21] text-gray-900 dark:text-white font-sans overflow-x-hidden">

            {/* Immersive Header Image */}
            <div className="relative h-80 w-full shrink-0 group">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1327&q=80")' }}>
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#111a21]/90 dark:to-[#111a21]"></div>

                {/* Top Navigation Bar */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-12 z-20">
                    <Link href="/directory" className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40 transition-colors text-white active:scale-95">
                        <FaArrowLeft />
                    </Link>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40 transition-colors text-white active:scale-95">
                        <FaHeart />
                    </button>
                </div>
            </div>

            {/* Floating Identity Card */}
            <div className="relative px-4 -mt-24 z-10 w-full">
                <div className="flex flex-col items-center rounded-[2rem] bg-white dark:bg-[#1c262e] p-6 shadow-xl shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/5 relative overflow-hidden">
                    {/* Decorative background blur */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-[#2791e7]/5 to-transparent opacity-50 pointer-events-none"></div>

                    {/* Avatar & Verified */}
                    <div className="-mt-16 mb-4 relative">
                        <div className="h-28 w-28 rounded-full border-[6px] border-white dark:border-[#1c262e] bg-cover bg-center shadow-lg shadow-black/10 flex items-center justify-center bg-gray-100"
                            style={{ backgroundImage: `url('/api/placeholder?name=${provider.business_name}')` }}>
                            {/* Fallback if no image, though API placeholder handles it usually, or we use icon */}
                        </div>
                        {provider.is_verified && (
                            <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#2791e7] text-white ring-4 ring-white dark:ring-[#1c262e] shadow-lg">
                                <FaCheckCircle size={14} />
                            </div>
                        )}
                    </div>

                    {/* Identity Info */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{provider.business_name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">{provider.provider_type}</p>

                        {/* Rating Chip */}
                        <div className="inline-flex items-center gap-1.5 bg-[#f6f7f8] dark:bg-black/20 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                            <FaStar className="text-amber-400 text-sm" />
                            <span className="font-bold text-sm text-gray-800 dark:text-white">{provider.rating_average || 0}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-0.5">{provider.total_reviews} reseñas</span>
                        </div>
                    </div>

                    {/* Quick Actions Bar */}
                    <div className="grid grid-cols-3 gap-3 w-full border-t border-gray-100 dark:border-white/5 pt-6">
                        <a href={`tel:${provider.phone}`} className="flex flex-col items-center gap-2 group cursor-pointer no-underline">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2791e7]/10 text-[#2791e7] dark:bg-[#2791e7]/20 dark:text-[#2791e7] transition-colors group-hover:bg-[#2791e7] group-hover:text-white">
                                <FaPhone size={20} />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-[#2791e7] transition-colors">Llamar</span>
                        </a>
                        <button className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 transition-colors group-hover:bg-green-600 group-hover:text-white">
                                <FaWhatsapp size={22} />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-green-500 transition-colors">WhatsApp</span>
                        </button>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.address}, ${provider.city}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 group cursor-pointer no-underline">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                                <FaMapMarkedAlt size={20} />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-purple-500 transition-colors">Mapa</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Specialties Carousel */}
            {specialities.length > 0 && (
                <div className="mt-8 w-full">
                    <div className="px-6 mb-3 flex justify-between items-end">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Especialidades</h2>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 px-6 no-scrollbar snap-x">
                        {specialities.map((spec, idx) => {
                            const theme = getThemeForSpecialty(spec);
                            return (
                                <div key={idx} className="snap-start shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#1c262e] shadow-sm ring-1 ring-black/5 dark:ring-white/5 min-w-[140px]">
                                    <div className={`p-2 rounded-full ${theme.bg} ${theme.text}`}>
                                        {getIconForSpecialty(spec)}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{spec}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Information Bento Grid */}
            <div className="mt-2 px-4 space-y-4">
                {/* About Section */}
                <div className="p-6 rounded-[1.5rem] bg-white dark:bg-[#1c262e] shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <FaInfoCircle className="text-[#2791e7]" size={20} />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Sobre nosotros</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {provider.description || "Comprometidos con el bienestar de tus mascotas."}
                    </p>
                </div>

                {/* Grid for Map and Hours */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Map Card */}
                    <div className="relative overflow-hidden rounded-[1.5rem] bg-white dark:bg-[#1c262e] shadow-sm ring-1 ring-black/5 dark:ring-white/5 min-h-[180px] group cursor-pointer">
                        <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80")' }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-md p-2 rounded-full shadow-lg">
                            <FaMapMarkerAlt className="text-[#2791e7] text-xl" />
                        </div>
                        <div className="absolute bottom-5 left-5 right-5 text-white">
                            <p className="font-bold text-base mb-0.5">{provider.address}</p>
                            <p className="text-xs font-medium text-gray-300">{provider.city}, {provider.state}</p>
                        </div>
                    </div>

                    {/* Hours Card */}
                    <div className="p-6 rounded-[1.5rem] bg-white dark:bg-[#1c262e] shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-2">
                                <FaClock className="text-[#2791e7]" size={20} />
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Horario</h3>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                <span className="block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Abierto
                            </span>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(schedule).map(([day, hours]) => (
                                <div key={day} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium capitalize">{day}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{hours}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-[#f6f7f8] via-[#f6f7f8]/90 to-transparent dark:from-[#111a21] dark:via-[#111a21]/90 pb-6 pt-10 pointer-events-none">
                <button className="pointer-events-auto w-full h-14 rounded-2xl bg-[#2791e7] hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/40 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]">
                    <FaCalendarAlt />
                    Agendar Cita
                </button>
            </div>
        </div>
    );
}
