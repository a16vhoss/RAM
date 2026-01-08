import { Suspense } from 'react';
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';

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
    // Fetch Pet & Owner Details
    const pet = await db.getOne(`
        SELECT p.*, u.first_name, u.last_name, u.phone, u.city 
        FROM pets p
        LEFT JOIN users u ON p.user_id = u.user_id
        WHERE p.pet_id = $1
    `, [id]);

    if (!pet) notFound();

    const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ram-weld-zeta.vercel.app'}/pets/${pet.pet_id}`;

    // Generate QR as Data URL on server
    const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 600,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    });

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start lg:py-10 print:bg-white print:p-0">
            {/* A4 Container (approx aspect ratio) */}
            <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] relative flex flex-col print:shadow-none print:w-full print:h-screen print:max-w-none">

                {/* Header */}
                <div className="bg-red-600 text-white text-center py-6 print:bg-red-600 print:-webkit-print-color-adjust-exact">
                    <h1 className="text-7xl font-black tracking-tighter uppercase leading-none mb-2">SE BUSCA</h1>
                    <p className="text-xl font-bold uppercase tracking-widest">Ayúdanos a encontrarlo</p>
                </div>

                {/* Hero Image */}
                <div className="w-full h-[500px] bg-gray-200 relative overflow-hidden print:h-[450px]">
                    <img
                        src={pet.pet_photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"}
                        alt={pet.pet_name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Main Info */}
                <div className="flex-1 p-10 flex flex-col items-center text-center gap-6">
                    <div>
                        <h2 className="text-6xl font-black text-slate-900 mb-2 uppercase">{pet.pet_name}</h2>
                        <div className="flex gap-4 justify-center text-2xl font-bold text-slate-600 uppercase">
                            <span>{pet.species}</span>
                            <span>•</span>
                            <span>{pet.breed}</span>
                            <span>•</span>
                            <span>{pet.sex === 'M' ? 'Macho' : 'Hembra'}</span>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div className="w-full grid grid-cols-2 gap-6 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200 print:bg-slate-50 print:border-slate-300">
                        <div>
                            <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Color / Señas</p>
                            <p className="text-xl font-bold text-slate-800">{pet.color}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Última vez visto</p>
                            <p className="text-xl font-bold text-slate-800">{pet.last_location || pet.city || 'No especificado'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Notas Adicionales</p>
                            <p className="text-lg text-slate-800 leading-snug">{pet.medical_notes || 'Pone nervioso con extraños, por favor no perseguir.'}</p>
                        </div>
                    </div>

                    {/* Contact & QR */}
                    <div className="flex w-full items-center justify-between gap-8 mt-4">
                        <div className="flex-1 text-left">
                            <p className="text-sm text-red-600 font-bold uppercase mb-1">Si lo has visto, llama urgente:</p>
                            <p className="text-5xl font-black text-slate-900 tracking-tight">{pet.phone || 'Sin teléfono'}</p>
                            <p className="text-xl font-medium text-slate-600 mt-2">{pet.first_name} {pet.last_name}</p>
                        </div>

                        <div className="flex flex-col items-center gap-2 bg-white p-4 border-4 border-slate-900 rounded-xl">
                            <div className="w-32 h-32 relative">
                                <img
                                    src={qrCodeDataUrl}
                                    alt="QR Code"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-900">Escanear Perfil</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t-4 border-dashed border-gray-300 p-6 flex justify-between items-center bg-slate-50 print:bg-transparent">
                    <p className="text-sm text-slate-400 font-medium">Generado por RAM (Registro Animal Municipal)</p>
                    <div className="flex gap-1 text-slate-900 font-bold text-sm items-center">
                        <span className="bg-slate-200 px-2 py-1 rounded text-xs">ram-app.com</span>
                    </div>
                </div>

                {/* Print Button */}
                <PrintTrigger />
            </div>
        </div>
    );
}

// Client Component
function PrintTrigger() {
    return (
        <button
            onClick={() => window.print()}
            className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform print:hidden z-50 hover:bg-black"
        >
            <span className="text-2xl">🖨️</span>
            Imprimir Cartel
        </button>
    )
}
