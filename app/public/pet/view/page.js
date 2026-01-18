'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaShareAlt, FaEllipsisV, FaCheckCircle, FaPaw, FaSyringe, FaMicrochip, FaMars, FaVenus, FaRulerVertical, FaPalette, FaBriefcaseMedical, FaChevronRight, FaMapMarkerAlt, FaPhone, FaWhatsapp, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function PublicPetViewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#111a21] flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <PublicPetViewContent />
        </Suspense>
    );
}

function PublicPetViewContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPet = async () => {
            if (!id) {
                setError('No se proporcionó ID de mascota');
                setLoading(false);
                return;
            }

            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
                const res = await fetch(`${API_BASE}/api/public/pet/${id}`);

                if (res.ok) {
                    const data = await res.json();
                    setPet(data);
                } else {
                    setError('Mascota no encontrada');
                }
            } catch (err) {
                console.error('Error fetching pet:', err);
                setError('Error de conexión');
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111a21] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div className="min-h-screen bg-[#111a21] flex items-center justify-center p-6 text-center">
                <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl max-w-md">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Mascota no encontrada</h2>
                    <p className="text-red-200 mb-6">{error || 'No se pudo cargar la información'}</p>
                    <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    const isLost = pet.status === 'lost' || pet.status === 'Perdido';
    const age = pet.birth_date ? new Date().getFullYear() - new Date(pet.birth_date).getFullYear() : '?';

    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-x-hidden pb-24 shadow-2xl bg-slate-50 dark:bg-[#111a21] text-slate-900 dark:text-white font-sans">

            {/* Top Navigation (Transparent) */}
            <div className="absolute top-0 left-0 w-full z-20 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/60 to-transparent">
                <Link href="/" className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition hover:bg-black/30">
                    <FaArrowLeft size={20} />
                </Link>
                <div className="flex gap-3">
                    <button className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition hover:bg-black/30">
                        <FaShareAlt size={18} />
                    </button>
                    <button className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white transition hover:bg-black/30">
                        <FaEllipsisV size={18} />
                    </button>
                </div>
            </div>

            {/* Hero Image Section */}
            <div className="relative w-full h-[55vh] shrink-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{
                    backgroundImage: `url(${pet.pet_photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000'})`,
                    backgroundSize: 'cover'
                }}></div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111a21] via-[#111a21]/60 to-transparent"></div>

                {/* Status Badge */}
                {isLost && (
                    <div className="absolute top-24 right-4 animate-pulse">
                        <div className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1.5 backdrop-blur-md border border-red-500/30 shadow-lg shadow-red-500/20">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-bold text-red-100 uppercase tracking-wider">Mascota Perdida</span>
                        </div>
                    </div>
                )}

                {/* Pet Name & Quick Stats */}
                <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-12">
                    <div className="flex items-end justify-between mb-2">
                        <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-sm">{pet.pet_name}</h1>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2791e7]/20 border border-[#2791e7]/30 backdrop-blur-sm">
                            <FaCheckCircle className="text-[#2791e7]" size={16} />
                            <span className="text-xs font-semibold text-blue-50">Verificado</span>
                        </div>
                    </div>
                    <p className="text-gray-300 text-base font-medium mb-4 flex items-center gap-2">
                        <FaPaw /> {pet.breed} • {age} Años
                    </p>

                    {/* Quick Action Chips */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shrink-0">
                            <FaSyringe className="text-green-400" size={18} />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-0.5">Salud</span>
                                <span className="text-xs font-semibold text-white leading-none">Vacunado</span>
                            </div>
                        </div>
                        <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shrink-0">
                            <FaMicrochip className="text-blue-400" size={18} />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-0.5">Registro</span>
                                <span className="text-xs font-semibold text-white leading-none">Microchip</span>
                            </div>
                        </div>
                        <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shrink-0">
                            {pet.sex === 'Macho' ? <FaMars className="text-purple-400" size={18} /> : <FaVenus className="text-pink-400" size={18} />}
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none mb-0.5">Sexo</span>
                                <span className="text-xs font-semibold text-white leading-none">{pet.sex}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="relative -mt-6 rounded-t-3xl bg-slate-50 dark:bg-[#111a21] px-5 pt-8 z-10 flex-1">

                {/* Alert Box (Conditional) */}
                {isLost ? (
                    <div className="mb-8 rounded-2xl bg-gradient-to-r from-white to-blue-50 dark:from-[#1e2832] dark:to-[#162028] p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2791e7]/10 text-[#2791e7]">
                                <FaShieldAlt size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">¡Ayúdame a volver!</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Me perdí. Si me ves, por favor llama a mi humano o escanea mi placa para ver mi ubicación.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 rounded-2xl bg-gradient-to-r from-white to-blue-50 dark:from-[#1e2832] dark:to-[#162028] p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                                <FaCheckCircle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Mascota Segura</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Esta mascota está protegida con RAM ID. Si la encuentras sola, contacta al dueño.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bento Grid Stats */}
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">Detalles Importantes</h4>
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="rounded-2xl bg-white dark:bg-[#1e2832] p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <FaRulerVertical className="text-gray-400" size={20} />
                            <span className="text-xs font-bold text-gray-400">PESO</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{pet.weight || '?'} kg</p>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-[#1e2832] p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <FaPalette className="text-gray-400" size={20} />
                            <span className="text-xs font-bold text-gray-400">COLOR</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{pet.color || 'N/A'}</p>
                    </div>
                    {pet.medical_notes && (
                        <div className="col-span-2 rounded-2xl bg-white dark:bg-[#1e2832] p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                                    <FaBriefcaseMedical className="text-orange-600 dark:text-orange-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Notas Médicas</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{pet.medical_notes}</p>
                                </div>
                            </div>
                            <FaChevronRight className="text-gray-400" />
                        </div>
                    )}
                </div>



                {/* ID and Official Footer */}
                <div className="flex flex-col items-center justify-center pb-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">ID Oficial de Registro</p>
                    <p className="font-mono text-sm tracking-widest text-gray-500 font-medium">MX-{pet.pet_id ? pet.pet_id.substring(0, 8).toUpperCase() : '00000000'}</p>
                    <div className="mt-6 flex items-center gap-2 opacity-50">
                        <FaShieldAlt className="text-gray-400" size={16} />
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Powered by RAM</span>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 w-full p-4 z-50 bg-gradient-to-t from-[#111a21] via-[#111a21] to-transparent pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <div className="flex gap-3">
                        <a href={`tel:${pet.phone}`} className="flex-1 h-14 rounded-xl bg-[#2791e7] text-white font-bold shadow-lg shadow-[#2791e7]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group decoration-0 no-underline">
                            <FaPhone className="group-hover:animate-bounce" />
                            Contactar Dueño
                        </a>
                        <a href={`https://wa.me/${pet.phone}`} className="h-14 w-14 shrink-0 rounded-xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 active:scale-[0.98] transition-all flex items-center justify-center decoration-0 no-underline">
                            <FaWhatsapp size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
