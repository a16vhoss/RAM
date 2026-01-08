import { Suspense } from 'react';
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import PosterQRCode from '@/app/components/PosterQRCode';
import PrintTrigger from '@/app/components/PrintTrigger';

export const metadata = {
    title: 'Cartel de Búsqueda - RAM',
    description: 'Generador de cartel para mascota perdida',
};

// Next.js 15: Page components can be async and params is a Promise
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
        // Fetch Pet & Owner Details
        const pet = await db.getOne(`
            SELECT p.*, u.first_name, u.last_name, u.phone, u.city 
            FROM pets p
            LEFT JOIN users u ON p.user_id = u.user_id
            WHERE p.pet_id = $1
        `, [id]);

        if (!pet) notFound();

        const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ram-weld-zeta.vercel.app'}/pets/${pet.pet_id}`;

        return (
            <>
                {/* Print-specific styles */}
                <style jsx global>{`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 0;
                        }
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                `}</style>

                <div className="min-h-screen bg-gray-100 flex justify-center items-start lg:py-10 print:bg-white print:p-0 print:m-0">
                    {/* A4 Container */}
                    <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] relative flex flex-col print:shadow-none print:w-full print:min-h-0 print:max-w-none">

                        {/* Header */}
                        <div className="bg-red-600 text-white text-center py-6 print:bg-red-600 print:-webkit-print-color-adjust-exact">
                            <h1 className="text-7xl font-black tracking-tighter uppercase leading-none mb-2">SE BUSCA</h1>
                            <p className="text-xl font-bold uppercase tracking-widest">Ayúdanos a encontrarlo</p>
                        </div>

                        {/* Hero Image - Reduced for print */}
                        <div className="w-full h-[500px] bg-gray-200 relative overflow-hidden print:h-[280px]">
                            <img
                                src={pet.pet_photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"}
                                alt={pet.pet_name}
                                className="w-full h-full object-cover print:object-contain print:bg-white"
                            />
                        </div>

                        {/* Main Info - Compact for print */}
                        <div className="flex-1 p-10 print:p-4 flex flex-col items-center text-center gap-6 print:gap-3">
                            <div>
                                <h2 className="text-6xl print:text-4xl font-black text-slate-900 mb-2 print:mb-1 uppercase">{pet.pet_name}</h2>
                                <div className="flex gap-4 print:gap-2 justify-center text-2xl print:text-lg font-bold text-slate-600 uppercase">
                                    <span>{pet.species}</span>
                                    <span>•</span>
                                    <span>{pet.breed}</span>
                                    <span>•</span>
                                    <span>{['M', 'MACHO', 'MALE'].includes(pet.sex?.toUpperCase()) ? 'Macho' : 'Hembra'}</span>
                                </div>
                            </div>

                            {/* Vitals - Compact for print */}
                            <div className="w-full grid grid-cols-2 gap-6 print:gap-2 text-left bg-slate-50 p-6 print:p-3 rounded-2xl print:rounded-lg border border-slate-200 print:bg-slate-50 print:border-slate-300">
                                <div>
                                    <p className="text-sm print:text-xs text-slate-500 uppercase font-bold tracking-wider">Color / Señas</p>
                                    <p className="text-xl print:text-base font-bold text-slate-800">{pet.color}</p>
                                </div>
                                <div>
                                    <p className="text-sm print:text-xs text-slate-500 uppercase font-bold tracking-wider">Última vez visto</p>
                                    <p className="text-xl print:text-base font-bold text-slate-800">{pet.last_location || pet.city || 'No especificado'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm print:text-xs text-slate-500 uppercase font-bold tracking-wider">Notas Adicionales</p>
                                    <p className="text-lg print:text-sm text-slate-800 leading-snug">{pet.medical_notes || 'Pone nervioso con extraños, por favor no perseguir.'}</p>
                                </div>
                            </div>

                            {/* Contact & QR - Compact for print */}
                            <div className="flex w-full items-center justify-between gap-8 print:gap-4 mt-4 print:mt-2">
                                <div className="flex-1 text-left">
                                    <p className="text-sm print:text-xs text-red-600 font-bold uppercase mb-1">Si lo has visto, llama urgente:</p>
                                    <p className="text-5xl print:text-3xl font-black text-slate-900 tracking-tight">{pet.phone || 'Sin teléfono'}</p>
                                    <p className="text-xl print:text-base font-medium text-slate-600 mt-2 print:mt-1">{pet.first_name} {pet.last_name}</p>
                                </div>

                                <div className="flex flex-col items-center gap-2 print:gap-1 bg-white p-4 print:p-2 border-4 print:border-2 border-slate-900 rounded-xl print:rounded-lg">
                                    <div className="w-32 h-32 print:w-20 print:h-20 relative">
                                        {/* Use Client Component for QR to avoid SSR issues */}
                                        <PosterQRCode url={profileUrl} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-900">Escanear Perfil</span>
                                </div>
                            </div>
                        </div>

                        {/* Print Button - Client Component */}
                        <PrintTrigger />
                    </div>
                </div>
            </>
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
                <a href="javascript:window.location.reload()" className="px-6 py-2 bg-slate-900 text-white rounded-lg">
                    Reintentar
                </a>
            </div>
        );
    }
}
