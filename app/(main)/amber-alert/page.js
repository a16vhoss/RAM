'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaExclamationTriangle, FaArrowLeft, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { API_BASE } from '@/app/actions/pet';

export default function AmberAlertPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Get Session
                const sessionRes = await fetch(`${API_BASE || ''}/api/auth/session`, { credentials: 'include' });
                const { session } = await sessionRes.json();

                if (!session || !session.user) {
                    router.push('/login');
                    return;
                }

                setUser(session.user);

                // 2. Get Pets via RPC (using getDashboardData as it returns pets)
                const rpcRes = await fetch(`${API_BASE || ''}/api/rpc/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'getDashboardData', data: {} })
                });

                const rpcData = await rpcRes.json();

                if (rpcData.success) {
                    setPets(rpcData.data.pets || []);
                }

            } catch (error) {
                console.error('Error loading amber alert data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background-dark pb-28 text-white relative overflow-hidden">
            {/* Background Ambient Glows */}
            <div className="fixed -top-[20%] -left-[10%] w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[10%] -right-[10%] w-[250px] h-[250px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

            <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                        <FaArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FaExclamationTriangle className="text-amber-500" />
                        Centro de Alerta RAM
                    </h1>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-6 mb-8 text-center backdrop-blur-md">
                    <h2 className="text-xl font-bold text-amber-100 mb-2">¿Tu mascota se ha perdido?</h2>
                    <p className="text-amber-200/80 text-sm max-w-lg mx-auto">
                        Inicia un reporte de extravío inmediato. Notificaremos a la comunidad cercana para ayudarte a encontrarla lo antes posible.
                    </p>
                </div>

                <h3 className="text-lg font-bold mb-4">Selecciona la mascota</h3>

                <div className="grid gap-4">
                    {pets.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                            <p className="text-slate-400 mb-4">No tienes mascotas registradas.</p>
                            <Link href="/pets/new" className="inline-block px-6 py-2 bg-primary rounded-full font-bold text-sm">
                                Registrar Mascota
                            </Link>
                        </div>
                    ) : (
                        pets.map((pet) => (
                            <div key={pet.pet_id} className="bg-slate-800/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-800 transition-colors">
                                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
                                    <img
                                        src={pet.pet_photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"}
                                        alt={pet.pet_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{pet.pet_name}</h3>
                                            <p className="text-slate-400 text-xs">{pet.breed}</p>
                                        </div>
                                        {pet.status === 'lost' ? (
                                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wide border border-red-500/30">
                                                Extraviado
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wide border border-green-500/30">
                                                En Casa
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3">
                                        {pet.status === 'lost' ? (
                                            <Link
                                                href={`/pets/view?id=${pet.pet_id}`}
                                                className="block w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-xl text-center font-bold text-sm transition-colors border border-red-600/30"
                                            >
                                                Ver Alerta Activa
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/pets/view?id=${pet.pet_id}&report=true`}
                                                className="block w-full py-2 bg-white text-red-600 hover:bg-red-50 rounded-xl text-center font-bold text-sm transition-colors shadow-lg"
                                            >
                                                🚨 REPORTAR EXTRAVÍO
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
