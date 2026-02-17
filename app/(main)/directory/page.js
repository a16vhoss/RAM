'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt, FaStar, FaFilter, FaChevronRight, FaSearch, FaBell, FaSlidersH, FaThLarge, FaStethoscope, FaCut, FaAmbulance, FaStore, FaRegHeart, FaMap, FaList, FaTimes, FaPhone, FaGlobe, FaClock, FaDirections } from 'react-icons/fa';

import { updateUserLocation } from '@/app/actions/user';

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

// Fake data for fallback
const mockProviders = [
    {
        business_name: "Veterinaria Huellitas",
        address: "Av. Insurgentes Sur 123, CDMX",
        rating_average: 4.8,
        total_reviews: 124,
        is_open: true,
        photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80",
        types: ["veterinary_care"],
        phone: "+525512345678",
        website: "https://huellitas.com",
        opening_hours: ["Lunes-Viernes: 9 AM - 7 PM", "Sábado: 10 AM - 2 PM", "Domingo: Cerrado"]
    },
    {
        business_name: "Clínica PetLife",
        address: "Calle Reforma 442, CDMX",
        rating_average: 4.5,
        total_reviews: 89,
        is_open: true,
        photo: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80",
        types: ["veterinary_care"],
        phone: "+525587654321",
        website: "https://petlife.mx",
        opening_hours: ["Lunes-Sábado: 8 AM - 8 PM", "Domingo: 10 AM - 4 PM"]
    },
    {
        business_name: "Hospital Veterinario 24h",
        address: "Colonia Roma Norte 55, CDMX",
        rating_average: 4.9,
        total_reviews: 312,
        is_open: true,
        photo: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80",
        types: ["veterinary_care", "hospital"],
        phone: "+525599887766",
        website: "https://hospitalvet24h.com",
        opening_hours: ["Abierto 24 horas, 7 días a la semana"]
    },
    {
        business_name: "Estética Canina Peludos",
        address: "Polanco V Sección, CDMX",
        rating_average: 4.2,
        total_reviews: 45,
        is_open: false,
        photo: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80",
        types: ["pet_store"],
        phone: "+525511223344",
        website: "https://peludos.com",
        opening_hours: ["Lunes-Viernes: 10 AM - 6 PM", "Sábado: 10 AM - 1 PM", "Domingo: Cerrado"]
    }
];

export default function DirectoryPage() {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [dbProviders, setDbProviders] = useState([]); // Initial DB results
    const [mapProviders, setMapProviders] = useState([]); // Google Maps results
    const [loading, setLoading] = useState(true);
    const [userAddress, setUserAddress] = useState('Detectando...'); // Location text state
    const [selectedVet, setSelectedVet] = useState(null); // State for selected vet for modal

    // Callback when map detects precise location/address
    const handleLocationDetected = useCallback(async (address, lat, lng) => {
        if (address) {
            setUserAddress(address); // Update UI immediately

            // Persist to DB
            try {
                await updateUserLocation(address, lat, lng);
            } catch (err) {
                console.error('Failed to save location to DB:', err);
            }
        }
    }, []);

    // Callback when map finds places (e.g., from Google Places API)
    const handlePlacesFound = useCallback((places) => {
        setMapProviders(places);
    }, []);

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
        <div className="min-h-screen bg-background-dark text-white pb-24">
            {/* Top Navigation & Location */}
            <header className="sticky top-0 z-40 w-full bg-green-950/95 backdrop-blur-xl pt-4 border-b border-white/5 shadow-md animate-slide-up">
                <div className="max-w-7xl mx-auto px-5 pb-3 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-primary border border-white/10">
                            <FaMapMarkerAlt size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-medium">Ubicación</span>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-white max-w-[200px] truncate">{userAddress}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex flex-col gap-6 px-5 py-6 max-w-7xl mx-auto w-full">
                {/* Headline & Toggle */}
                <div className="flex items-end justify-between">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        Encuentra <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">cerca de ti</span>
                    </h1>

                    {/* Map/List Toggle */}
                    <div className="flex bg-[#1c252e] p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FaList />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FaMap />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="relative w-full h-14 bg-surface-dark rounded-2xl border border-white/5 flex items-center shadow-lg focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                        <div className="pl-4 pr-3 text-slate-400">
                            <FaSearch size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar veterinarias..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-full bg-transparent border-none outline-none text-white text-base pr-4 placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative min-h-[500px]">

                    {/* Map View (Always mounted to keep state/location, hidden via CSS) */}
                    <div className={`w-full h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative ${viewMode === 'list' ? 'hidden' : 'block'}`}>
                        {/* Map Overlay Info */}
                        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <span className="text-xs font-bold text-white">Mostrando resultados en tiempo real</span>
                        </div>
                        <ClientMap onPlacesFound={handlePlacesFound} onLocationDetected={handleLocationDetected} />
                    </div>

                    {/* List View */}
                    <div className={`${viewMode === 'map' ? 'hidden' : 'block'}`}>
                        <div className="flex flex-col gap-5">
                            {/* Filter Chips */}
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {filters.map(f => (
                                    <button
                                        key={f.name}
                                        onClick={() => setActiveFilter(f.name)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeFilter === f.name
                                            ? 'bg-primary text-white shadow-glow border-primary'
                                            : 'bg-surface-dark text-gray-400 border-white/5 hover:bg-white/5'
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {displayProviders.map((p, index) => (
                                        <button onClick={() => setSelectedVet(p)} key={index} className="block group text-left w-full h-full">
                                            <div className="bg-surface-dark rounded-3xl overflow-hidden border border-white/5 shadow-xl transition-all group-hover:scale-[1.02] group-hover:border-primary/30 h-full flex flex-col">
                                                <div className="h-40 bg-gray-700 relative shrink-0">
                                                    {/* Image */}
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center"
                                                        style={{ backgroundImage: `url(${p.photo || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80'})` }}
                                                    ></div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent"></div>
                                                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full text-white">
                                                        <FaRegHeart />
                                                    </div>
                                                    {p.distance && (
                                                        <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg">
                                                            📍 {p.distance.toFixed(1)} km
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-5 relative -mt-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-bold text-white line-clamp-1">{p.business_name}</h3>
                                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20 shrink-0">
                                                            <FaStar className="text-yellow-500 text-xs" />
                                                            <span className="text-yellow-500 text-sm font-bold">{p.rating_average || 4.5}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-400 flex items-center gap-1 mb-4 line-clamp-2">
                                                        <FaMapMarkerAlt className="shrink-0" /> {p.address || 'Ubicación desconocida'}
                                                    </p>
                                                    <div className="mt-auto flex items-center gap-2 flex-wrap">
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
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <VetDetailsModal vet={selectedVet} onClose={() => setSelectedVet(null)} />
        </div>
    );
}

function VetDetailsModal({ vet, onClose }) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (vet) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [vet]);

    if (!vet) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/70 backdrop-blur-sm p-4 sm:items-center">
            <div className="bg-[#1c252e] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-2 bg-black/50 rounded-full">
                    <FaTimes size={20} />
                </button>

                <div className="h-48 bg-gray-700 relative">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${vet.photo || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80'})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c252e] to-transparent"></div>
                </div>

                <div className="p-6 -mt-12 relative">
                    <h2 className="text-3xl font-bold text-white mb-2">{vet.business_name}</h2>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                            <FaStar className="text-yellow-500 text-xs" />
                            <span className="text-yellow-500 text-sm font-bold">{vet.rating_average || 4.5}</span>
                        </div>
                        <span className="text-gray-400 text-sm">({vet.total_reviews || 0} reseñas)</span>
                    </div>

                    <p className="text-gray-300 flex items-center gap-2 mb-3">
                        <FaMapMarkerAlt className="text-primary" /> {vet.address || 'Ubicación desconocida'}
                    </p>

                    {vet.phone && (
                        <a href={`tel:${vet.phone}`} className="text-gray-300 flex items-center gap-2 mb-3 hover:text-primary transition-colors">
                            <FaPhone className="text-primary" /> {vet.phone}
                        </a>
                    )}

                    {vet.website && (
                        <a href={vet.website} target="_blank" rel="noopener noreferrer" className="text-gray-300 flex items-center gap-2 mb-3 hover:text-primary transition-colors">
                            <FaGlobe className="text-primary" /> {vet.website.replace(/(^\w+:|^)\/\//, '')}
                        </a>
                    )}

                    {vet.opening_hours && (
                        <div className="text-gray-300 flex items-start gap-2 mb-4">
                            <FaClock className="text-primary mt-1" />
                            <div>
                                {vet.opening_hours.map((hour, i) => (
                                    <p key={i}>{hour}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${vet.is_open ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {vet.is_open ? 'Abierto' : 'Cerrado'}
                        </span>
                        {vet.types && vet.types.map((type, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-gray-400 capitalize">
                                {type.replace('_', ' ')}
                            </span>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(vet.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                        >
                            <FaDirections /> Cómo llegar
                        </a>
                        {vet.phone && (
                            <a
                                href={`tel:${vet.phone}`}
                                className="flex-1 flex items-center justify-center gap-2 border border-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                            >
                                <FaPhone /> Llamar
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
