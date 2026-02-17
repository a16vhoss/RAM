'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';

export default function PosterViewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-300"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>}>
            <PosterViewContent />
        </Suspense>
    );
}

function PosterViewContent() {
    const searchParams = useSearchParams();
    const petId = searchParams.get('id');

    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        async function fetchPet() {
            if (!petId) {
                setError('No se proporcionó ID de mascota');
                setLoading(false);
                return;
            }

            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
                const res = await fetch(`${API_BASE}/api/pets/${petId}`);

                if (res.ok) {
                    const data = await res.json();
                    setPet(data);

                    // Generate QR
                    const profileUrl = `${window.location.origin}/pets/view?id=${petId}`;
                    const qr = await QRCode.toDataURL(profileUrl, {
                        width: 150,
                        margin: 1,
                        color: { dark: '#000000', light: '#FFFFFF' }
                    });
                    setQrCodeUrl(qr);
                } else {
                    setError('No se pudo cargar la información de la mascota');
                }
            } catch (err) {
                setError('Error de conexión: ' + err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPet();
    }, [petId]);

    useEffect(() => {
        // Auto-print trigger after load
        if (pet && !loading) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [pet, loading]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-300">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Generando cartel...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-300 p-8">
                <div className="text-center bg-white p-8 rounded-lg shadow-xl">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!pet) return null;

    return (
        <div className="min-h-screen bg-gray-300 flex justify-center items-center py-8 print:py-0 print:bg-white">
            {/* A4 Container - Fixed 794px width (A4 at 96dpi) */}
            <div
                id="poster-container"
                style={{ width: '794px', height: '1123px' }}
                className="bg-white shadow-2xl relative flex flex-col overflow-hidden print:shadow-none"
            >
                {/* HEADER */}
                <div className="bg-red-600 text-white py-5 px-6 text-center shrink-0">
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-none mb-3">
                        SE BUSCA
                    </h1>
                    <p className="text-lg font-semibold uppercase tracking-[0.15em] opacity-90">Ayúdanos a encontrarlo</p>
                </div>

                {/* PHOTO */}
                <div className="flex-1 relative bg-gray-200 overflow-hidden">
                    <img
                        src={pet.pet_photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"}
                        alt={pet.pet_name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-1.5 rounded-full font-bold uppercase text-sm shadow-lg">
                        Recompensa
                    </div>
                </div>

                {/* DETAILS */}
                <div className="px-6 py-4 bg-white shrink-0">
                    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-3 mb-3">
                        <div>
                            <h2 className="text-5xl font-black text-gray-900 uppercase leading-none">
                                {pet.pet_name}
                            </h2>
                            <p className="text-lg text-gray-500 font-bold uppercase mt-1">
                                {pet.breed} • {pet.color}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase font-bold">Última vez visto</p>
                            <p className="text-xl font-black text-gray-800 uppercase">
                                {pet.last_location || pet.city || 'Desconocido'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Notas</p>
                        <p className="text-base text-gray-700 leading-snug">
                            {pet.medical_notes || 'Si lo has visto, por favor contáctanos inmediatamente.'}
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="bg-green-950 text-white p-5 shrink-0 flex items-center justify-between">
                    <div className="overflow-hidden">
                        <p className="text-red-400 font-bold uppercase text-sm tracking-widest mb-1">
                            ¡Llama Urgente!
                        </p>
                        <p className="text-4xl font-black leading-none tracking-normal">
                            {pet.ownerPhone || '000-000-0000'}
                        </p>
                        <p className="text-xl text-gray-200 mt-1 pb-1 font-semibold tracking-wide">
                            {pet.ownerName || 'Contacto'}
                        </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shrink-0 flex flex-col items-center">
                        <div className="w-16 h-16">
                            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />}
                        </div>
                        <span className="text-[9px] font-bold uppercase text-gray-900 mt-0.5">Escanear</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
