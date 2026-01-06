'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt, FaStar, FaFilter, FaChevronRight, FaSearch, FaBell, FaSlidersH, FaThLarge, FaStethoscope, FaCut, FaAmbulance, FaStore, FaRegHeart, FaMap, FaList } from 'react-icons/fa';

// Dynamically import ClientMap with SSR disabled to prevent Leaflet errors during build
const ClientMap = dynamic(
    () => import('@/components/directory/ClientMap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-[#1c252e] rounded-3xl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2791e7] mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando mapa...</p>
                </div>
            </div>
        )
    }
);

export default function DirectoryPage() {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [dbProviders, setDbProviders] = useState([]); // Initial DB results
    const [mapProviders, setMapProviders] = useState([]); // Google Maps results
    const [loading, setLoading] = useState(true);

    // Fetch initial DB data
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                // In a real app we'd call an API route here, for now simulating or fetching if API exists
                // We'll trust the map for real-time mostly, but let's fetch static as backup/list base
                // For this demo, we'll start empty or fetch from our API if we converted it.
                // Since this page was async server component, we need an API endpoint to fetch DB providers now.
                // Assuming we have one or will create one. For now, let's use map data as primary if in map mode.
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        fetchProviders();
    }, []);

    const filters = [
        { name: 'Todos', icon: <FaThLarge /> },
        { name: 'Veterinarias', icon: <FaStethoscope /> },
        { name: 'Estética', icon: <FaCut /> },
        { name: 'Urgencias', icon: <FaAmbulance /> },
        { name: 'Tiendas', icon: <FaStore /> }
    ];


    const displayProviders = viewMode === 'map' && mapProviders.length > 0 ? mapProviders : dbProviders;

    return (
        <div style={{ minHeight: '100vh', padding: '0 0 100px 0', background: 'var(--background-dark)', color: 'white' }}>
            {/* Top Navigation & Location */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40, width: '100%',
                background: 'rgba(17, 26, 33, 0.95)', backdropFilter: 'blur(12px)', paddingTop: '16px'
            }}>
                <div style={{ padding: '0 20px 12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-dark)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                        }}>
                            <FaMapMarkerAlt size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Ubicación</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>Detectando...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 20px' }}>
                {/* Headline & Toggle */}
                <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <h1 style={{
                        fontSize: '30px', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Encuentra <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>cerca de ti</span>
                    </h1>

                    {/* Map/List Toggle */}
                    <div className="flex bg-[#1c252e] p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#2791e7] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FaList />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-[#2791e7] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FaMap />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        position: 'relative', width: '100%', height: '56px', background: 'var(--surface-dark)',
                        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ paddingLeft: '16px', paddingRight: '12px', color: '#94a3b8' }}>
                            <FaSearch size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar veterinarias..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                width: '100%', height: '100%', background: 'transparent', border: 'none',
                                outline: 'none', color: 'white', fontSize: '16px', paddingRight: '16px'
                            }}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ height: viewMode === 'map' ? '500px' : 'auto', transition: 'height 0.3s' }}>
                    {viewMode === 'map' ? (
                        <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                            {/* Map Overlay Info */}
                            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                <span className="text-xs font-bold text-white">Mostrando resultados en tiempo real</span>
                            </div>
                            <ClientMap onPlacesFound={setMapProviders} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Filter Chips (Only show in list for now or both?) */}
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {filters.map(f => (
                                    <button
                                        key={f.name}
                                        onClick={() => setActiveFilter(f.name)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeFilter === f.name
                                            ? 'bg-[#2791e7] text-white shadow-glow'
                                            : 'bg-[#1c252e] text-gray-400 border border-white/5'
                                            }`}
                                    >
                                        {f.icon} {f.name}
                                    </button>
                                ))}
                            </div>

                            {/* List Results */}
                            {displayProviders.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <p>No se encontraron resultados. Intenta cambiar a la vista de Mapa.</p>
                                </div>
                            ) : (
                                displayProviders.map((p, index) => (
                                    <Link href={`#`} key={index} className="block group">
                                        <div className="bg-[#1c252e] rounded-3xl overflow-hidden border border-white/5 shadow-xl transition-all group-hover:scale-[1.02]">
                                            <div className="h-40 bg-gray-700 relative">
                                                {/* Image */}
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${p.photo || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCij_BIYrl-l0jSpnWiTQTgbi4gpEPBgfG0VEYmUH18lqC8CO1lAzOjZyV8FJ-5PXZIqL8a8nw9OIszODyvPNsHxMSgPGNX6mYLxQCyaAHrkDzKpSVeZ7luaRsYmxIa3Jd9cxm24v-tMa7JGyEwJ1DcIBQBpaj6YQSwZ2OpBmmK2a2Wvr4u5ymUbkjMdFOLqj-ZdfYaPl3vm-UMp-ReC6jloy96gmygy-_5DAvFUrZur8LN27W4qniYkfeBDKKtzh6hfAVWARWF2V0E'})` }}
                                                ></div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1c252e] to-transparent"></div>
                                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full text-white">
                                                    <FaRegHeart />
                                                </div>
                                            </div>
                                            <div className="p-5 relative -mt-6">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold text-white">{p.business_name}</h3>
                                                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                                        <FaStar className="text-yellow-500 text-xs" />
                                                        <span className="text-yellow-500 text-sm font-bold">{p.rating_average || 4.5}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-400 flex items-center gap-1 mb-4">
                                                    <FaMapMarkerAlt /> {p.address || 'Ubicación desconocida'}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${p.is_open ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {p.is_open ? 'Abierto' : 'Cerrado'}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-gray-400">
                                                        Veterinaria
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

