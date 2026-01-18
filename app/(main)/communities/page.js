'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUsers, FaDog, FaCat, FaDove, FaFish, FaPaw, FaSearch, FaChevronRight, FaPlus } from 'react-icons/fa';
import { getCommunities, getUserCommunities, searchCommunities } from '@/app/actions/community';

const speciesIcons = {
    'Perro': FaDog,
    'Gato': FaCat,
    'Ave': FaDove,
    'Pez': FaFish,
    'Roedor': FaPaw,
    'Reptil': FaPaw,
    'Otro': FaPaw,
};

const speciesColors = {
    'Perro': 'from-amber-500 to-orange-600',
    'Gato': 'from-purple-500 to-pink-600',
    'Ave': 'from-cyan-500 to-blue-600',
    'Pez': 'from-blue-500 to-indigo-600',
    'Roedor': 'from-yellow-500 to-amber-600',
    'Reptil': 'from-green-500 to-emerald-600',
    'Otro': 'from-slate-500 to-gray-600',
};

export default function CommunitiesPage() {
    const router = useRouter();
    const [allCommunities, setAllCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'my'

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [allRes, myRes] = await Promise.all([
                getCommunities({ type: 'species' }),
                getUserCommunities()
            ]);

            if (allRes.success) setAllCommunities(allRes.data);
            if (myRes.success) setMyCommunities(myRes.data);
            setLoading(false);
        };

        loadData();
    }, []);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length > 2) {
            const res = await searchCommunities(query);
            if (res.success) setSearchResults(res.data);
        } else {
            setSearchResults([]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-white pb-28">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FaUsers className="text-primary" /> Comunidades
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar comunidades..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab('discover')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'discover' ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                            Explorar
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                            Mis Comunidades ({myCommunities.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {searchQuery.length > 2 && (
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h2 className="text-lg font-bold mb-4">Resultados de búsqueda</h2>
                    {searchResults.length > 0 ? (
                        <div className="grid gap-3">
                            {searchResults.map((community) => (
                                <CommunityCard key={community.community_id} community={community} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">No se encontraron comunidades</p>
                    )}
                </div>
            )}

            {/* Main Content */}
            {searchQuery.length <= 2 && (
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {activeTab === 'discover' && (
                        <>
                            {/* Species Communities Grid */}
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FaPaw className="text-primary" /> Comunidades por Especie
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                {allCommunities.map((community) => {
                                    const IconComponent = speciesIcons[community.species] || FaPaw;
                                    const gradient = speciesColors[community.species] || speciesColors['Otro'];

                                    return (
                                        <Link
                                            key={community.community_id}
                                            href={`/communities/view?slug=${community.slug}`}
                                            className="group relative overflow-hidden rounded-2xl aspect-square"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                                            <div className="relative h-full p-4 flex flex-col justify-between">
                                                <IconComponent className="text-white/30 text-5xl" />
                                                <div>
                                                    <h3 className="text-white font-bold text-lg leading-tight">{community.name.replace(/^[^\s]+\s/, '')}</h3>
                                                    <p className="text-white/70 text-xs mt-1">{community.member_count} miembros</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Popular Breed Communities */}
                            <h2 className="text-lg font-bold mb-4">🔥 Comunidades Populares</h2>
                            <p className="text-slate-400 text-sm mb-4">
                                Las comunidades de raza se crean automáticamente cuando registras tu mascota.
                            </p>
                        </>
                    )}

                    {activeTab === 'my' && (
                        <>
                            {myCommunities.length > 0 ? (
                                <div className="grid gap-3">
                                    {myCommunities.map((community) => (
                                        <CommunityCard key={community.community_id} community={community} showBadge />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaUsers className="text-4xl text-slate-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Sin comunidades</h3>
                                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                                        Registra una mascota y automáticamente te unirás a comunidades relacionadas con su especie y raza.
                                    </p>
                                    <Link
                                        href="/pets/new"
                                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-colors"
                                    >
                                        <FaPlus /> Registrar Mascota
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function CommunityCard({ community, showBadge = false }) {
    const IconComponent = speciesIcons[community.species] || FaPaw;

    return (
        <Link
            href={`/communities/view?slug=${community.slug}`}
            className="group bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-white/5 hover:bg-slate-800 transition-colors"
        >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary flex-shrink-0">
                <IconComponent size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">
                        {community.name}
                    </h3>
                    {showBadge && community.is_auto_joined && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Auto</span>
                    )}
                </div>
                <p className="text-slate-400 text-sm truncate">{community.description}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span>{community.member_count} miembros</span>
                    <span>{community.post_count} posts</span>
                </div>
            </div>
            <FaChevronRight className="text-slate-600 group-hover:text-white transition-colors flex-shrink-0" />
        </Link>
    );
}
