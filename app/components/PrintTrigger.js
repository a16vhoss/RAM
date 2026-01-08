'use client';

export default function PrintTrigger() {
    return (
        <button
            onClick={() => window.print()}
            className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform print:hidden z-50 hover:bg-black"
        >
            <span className="text-2xl">🖨️</span>
            Imprimir Cartel
        </button>
    );
}
