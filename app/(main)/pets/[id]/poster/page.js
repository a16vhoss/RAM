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
            <div className="min-h-screen bg-gray-300 flex justify-center items-center py-8">
                {/* A4 Container - Fixed 794px width (A4 at 96dpi) */}
                <div
                    id="poster-container"
                    style={{ width: '794px', height: '1123px' }}
                    className="bg-white shadow-2xl relative flex flex-col overflow-hidden"
                >
                    {/* HEADER */}
                    <div className="bg-red-600 text-white py-5 px-6 text-center shrink-0">
                        <h1 className="text-6xl font-black tracking-tight uppercase leading-none mb-1">
                            SE BUSCA
                        </h1>
                        <p className="text-lg font-semibold uppercase tracking-widest opacity-90">Ayúdanos a encontrarlo</p>
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
                    <div className="bg-gray-900 text-white p-4 shrink-0 flex items-center justify-between">
                        <div className="overflow-hidden">
                            <p className="text-red-400 font-bold uppercase text-xs mb-0.5">
                                ¡Llama Urgente!
                            </p>
                            <p className="text-4xl font-black leading-none tracking-tight">
                                {pet.phone || '000-000-0000'}
                            </p>
                            <p className="text-base text-gray-400 mt-0.5">
                                {pet.first_name} {pet.last_name}
                            </p>
                        </div>
                        <div className="bg-white p-2 rounded-lg shrink-0 flex flex-col items-center">
                            <div className="w-16 h-16">
                                <PosterQRCode url={profileUrl} />
                            </div>
                            <span className="text-[9px] font-bold uppercase text-gray-900 mt-0.5">Escanear</span>
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
                <p className="text-gray-600">{error.message}</p>
            </div>
        );
    }
}
