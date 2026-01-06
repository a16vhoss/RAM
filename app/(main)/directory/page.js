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

    // Fake data for fallback
    const mockProviders = [
        {
            business_name: "Veterinaria Huellitas",
            address: "Av. Insurgentes Sur 123, CDMX",
            rating_average: 4.8,
            total_reviews: 124,
            is_open: true,
            photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80",
            types: ["veterinary_care"]
        },
        {
            business_name: "Clínica PetLife",
            address: "Calle Reforma 442, CDMX",
            rating_average: 4.5,
            total_reviews: 89,
            is_open: true,
            photo: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80",
            types: ["veterinary_care"]
        },
        {
            business_name: "Hospital Veterinario 24h",
            address: "Colonia Roma Norte 55, CDMX",
            rating_average: 4.9,
            total_reviews: 312,
            is_open: true,
            photo: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80",
            types: ["veterinary_care", "hospital"]
        },
        {
            business_name: "Estética Canina Peludos",
            address: "Polanco V Sección, CDMX",
            rating_average: 4.2,
            total_reviews: 45,
            is_open: false,
            photo: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80",
            types: ["pet_store"]
        }
    ];

    // Fetch initial DB data
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                // Simulate fetch delay
                // Only use mock if we really have nothing else or as instant fallback
                setDbProviders(mockProviders);
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


    // Prioritize map results if available (real-time nearby), otherwise fallback to mock/db
    const displayProviders = mapProviders.length > 0 ? mapProviders : dbProviders;

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
                <div style={{ position: 'relative', minHeight: '500px' }}>

                    {/* Map View (Always mounted to keep state/location, hidden via CSS) */}
                    <div className={`w-full h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative ${viewMode === 'list' ? 'hidden' : 'block'}`}>
                        {/* Map Overlay Info */}
                        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <span className="text-xs font-bold text-white">Mostrando resultados en tiempo real</span>
                        </div>
                        <ClientMap onPlacesFound={setMapProviders} />
                    </div>

                    {/* List View */}
                    <div className={`${viewMode === 'map' ? 'hidden' : 'block'}`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Filter Chips */}
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
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p>Buscando veterinarias cerca de tu ubicación...</p>
                                </div>
                            ) : (
                                displayProviders.map((p, index) => (
                                    <Link href={`#`} key={index} className="block group">
                                        <div className="bg-[#1c252e] rounded-3xl overflow-hidden border border-white/5 shadow-xl transition-all group-hover:scale-[1.02]">
                                            <div className="h-40 bg-gray-700 relative">
                                                {/* Image */}
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${p.photo || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80'})` }}
                                                ></div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1c252e] to-transparent"></div>
                                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full text-white">
                                                    <FaRegHeart />
                                                </div>
                                                {p.distance && (
                                                    <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg">
                                                        📍 {p.distance.toFixed(1)} km
                                                    </div>
                                                )}
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
                                                    {p.types && p.types.map((type, i) => i < 2 && (
                                                        <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-gray-400 capitalize">
                                                            {type.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

