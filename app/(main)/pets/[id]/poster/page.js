import { Suspense } from 'react';
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import PosterQRCode from '@/app/components/PosterQRCode';
import PrintTrigger from '@/app/components/PrintTrigger';

export const metadata = {
    title: 'Cartel de Búsqueda - RAM',
    description: 'Generador de cartel para mascota perdida',
};

export default async function PosterPage({ params }) {
    const { id } = await params;

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando cartel...</div>}>
            <PosterContent id={id} />
        </Suspense>
    );
}

async function PosterContent({ id }) {
    try {
        const pet = await db.getOne(`
            SELECT p.*, u.first_name, u.last_name, u.phone, u.city 
            FROM pets p
            LEFT JOIN users u ON p.user_id = u.user_id
            WHERE p.pet_id = $1
        `, [id]);

        if (!pet) notFound();

        const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ram-weld-zeta.vercel.app'}/pets/${pet.pet_id}`;

        return (
            <div className="min-h-screen bg-gray-200 flex justify-center items-center py-8">
                {/* A4 Container - Strict Size */}
                <div
                    id="poster-container"
                    className="bg-white w-[210mm] h-[297mm] shadow-2xl relative flex flex-col overflow-hidden"
                    style={{ aspectRatio: '210/297' }}
                >
                    {/* 1. HEADER - High Contrast */}
                    <div className="bg-[#DC2626] text-white pt-6 pb-4 px-8 text-center shrink-0 relative z-10">
                        <div className="absolute top-0 left-0 w-full h-2 bg-black/20"></div>
                        <h1 className="text-7xl font-black tracking-tighter uppercase mb-1 drop-shadow-md font-sans leading-none">
                            SE BUSCA
                        </h1>
                        <p className="text-xl font-bold uppercase tracking-[0.2em] text-red-50">Ayúdanos a encontrarlo</p>
                    </div>

                    {/* 2. MAIN PHOTO - Optimized to fill space */}
                    <div className="flex-1 relative bg-gray-100 overflow-hidden border-y-8 border-white min-h-[300px]">
                        <img
                            src={pet.pet_photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"}
                            alt={pet.pet_name}
                            className="w-full h-full object-cover"
                        />

                        {/* Status Badge Overlay */}
                        <div className="absolute bottom-6 right-6 bg-red-600 text-white px-5 py-2 rounded-full font-bold uppercase tracking-wider text-base shadow-lg border-2 border-white transform rotate-[-2deg]">
                            Recompensa
                        </div>
                    </div>

                    {/* 3. DETAILS SECTION */}
                    <div className="px-8 py-5 bg-white shrink-0 relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-3">
                            <div className="min-w-0 flex-1 mr-4">
                                <h2 className="text-6xl font-black text-slate-900 leading-none uppercase tracking-tight truncate">
                                    {pet.pet_name}
                                </h2>
                                <p className="text-xl text-slate-500 font-bold mt-1 uppercase flex items-center gap-2 truncate">
                                    <span>{pet.breed}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                    <span>{pet.color}</span>
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Última vez visto en</p>
                                <p className="text-xl font-black text-slate-800 uppercase leading-none max-w-[180px] break-words">
                                    {pet.last_location || pet.city || 'Desconocido'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Señas Particulares / Notas</p>
                                <p className="text-lg font-medium text-slate-800 leading-snug line-clamp-3">
                                    {pet.medical_notes || 'Si lo has visto, por favor contáctanos inmediatamente. Es muy querido por su familia.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4. FOOTER - CONTACT */}
                    <div className="bg-slate-900 text-white p-5 shrink-0 flex items-center justify-between gap-4 overflow-hidden">
                        <div className="min-w-0 flex-1">
                            <p className="text-red-400 font-bold uppercase tracking-widest text-xs mb-0.5">
                                ¡Reportar Avistamiento!
                            </p>
                            <p className="text-5xl font-black leading-none tracking-tight text-white tabular-nums truncate">
                                {pet.phone || '000-000-0000'}
                            </p>
                            <p className="text-lg text-slate-400 font-medium mt-0.5 truncate">
                                {pet.first_name} {pet.last_name}
                            </p>
                        </div>

                        <div className="bg-white p-2 rounded-xl shrink-0 flex flex-col items-center gap-0.5 w-20">
                            <div className="w-16 h-16 relative">
                                <PosterQRCode url={profileUrl} />
                            </div>
                            <span className="text-[0.55rem] font-black uppercase text-slate-900 tracking-wider">Escanear</span>
                        </div>
                    </div>

                    <PrintTrigger />
                </div>
            </div>
        );
    } catch (error) {
        console.error('SERVER ERROR in PosterPage:', error);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-100">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Error al generar cartel</h1>
                <p className="text-slate-600 mb-2">Hubo un problema al cargar los datos de la mascota.</p>
                <div className="bg-white p-4 rounded-lg shadow border border-red-200 text-left max-w-lg mb-6 overflow-auto">
                    <p className="font-mono text-sm text-red-500 break-all">{error.message}</p>
                </div>
            </div>
        );
    }
}
