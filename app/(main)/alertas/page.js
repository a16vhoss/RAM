import { getLostPets } from '@/app/actions/pet';
import Link from 'next/link';
import { FaSearch, FaMapMarkerAlt, FaPaw, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

export const metadata = {
    title: 'Alerta RAM | Mascotas Perdidas - RAM',
    description: 'Ayuda a encontrar mascotas perdidas en tu comunidad. Directorio oficial de búsqueda del Registro Animal Municipal.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LostPetsPage({ searchParams }) {
    const params = await searchParams;
    const city = params?.city || '';
    const species = params?.species || '';
    const query = params?.query || '';

    const { data: pets, cities } = await getLostPets({ city, species, query });

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-20">
            {/* Header / Hero */}
            <div className="relative bg-[#111a21] py-16 px-4 w-full">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                <div className="relative w-full px-4 md:px-12 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 font-bold text-xs uppercase tracking-widest mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Alerta RAM Activa
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Ayúdalos a volver a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">casa</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Directorio oficial de búsqueda. Si has visto a alguna de estas mascotas, por favor reportalo inmediatamente.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="w-full px-4 md:px-12 -mt-8 relative z-20">
                <form className="bg-white dark:bg-[#162028] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="query"
                            placeholder="Buscar por nombre o raza..."
                            defaultValue={query}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1115] border-none focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-2">
                        <select
                            name="city"
                            defaultValue={city}
                            className="flex-1 md:w-48 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1115] border-none focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Todas las Ciudades</option>
                            {cities?.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <select
                            name="species"
                            defaultValue={species}
                            className="flex-1 md:w-40 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0b1115] border-none focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Especie</option>
                            <option value="Perro">Perro</option>
                            <option value="Gato">Gato</option>
                            <option value="Otro">Otro</option>
                        </select>
                        <button type="submit" className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary/20">
                            Filtrar
                        </button>
                    </div>
                </form>
            </div>

            {/* Grid Section */}
            <div className="w-full px-4 md:px-12 py-12">
                {pets && pets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {pets.map((pet) => (
                            <Link href={`/pets/${pet.pet_id}`} key={pet.pet_id} className="group relative bg-white dark:bg-[#162028] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                {/* Image Container */}
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#162028] via-transparent to-transparent opacity-80 z-10"></div>
                                    <img
                                        src={pet.pet_photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80'}
                                        alt={pet.pet_name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg animate-pulse flex items-center gap-1">
                                            <FaExclamationTriangle /> Perdido
                                        </span>
                                    </div>

                                    {/* Bottom Info */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                                        <h3 className="text-2xl font-bold text-white mb-1 leading-none">{pet.pet_name}</h3>
                                        <p className="text-sm text-gray-300 flex items-center gap-1 mb-3">
                                            <FaPaw size={12} /> {pet.breed}
                                        </p>

                                        <div className="flex flex-col gap-1">
                                            {pet.city && (
                                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg w-max">
                                                    <FaMapMarkerAlt className="text-red-400" />
                                                    {pet.city}
                                                </div>
                                            )}
                                            <div className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-center text-xs font-bold text-white uppercase tracking-wider transition-colors border border-white/10">
                                                Ver Detalles
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <FaShieldAlt className="text-slate-300 dark:text-slate-600 text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No hay alertas activas</h3>
                        <p className="text-slate-500 max-w-md">
                            Por el momento no hay reportes de mascotas perdidas que coincidan con tu búsqueda. ¡Qué buenas noticias!
                        </p>
                        {(city || species || query) && (
                            <Link href="/alertas" className="mt-6 px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-full font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                Limpiar Filtros
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
