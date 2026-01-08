'use client';

import { useState } from 'react';
import { joinFamily } from '@/app/actions/family';
import { FaUsers, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function JoinFamilyModal({ isOpen, onClose }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setError(null);

        const result = await joinFamily(code);

        if (result.success) {
            setMessage(result.message);
            setCode('');
            // Wait a moment then close and refresh?
            setTimeout(() => {
                onClose();
                router.refresh();
            }, 1500);
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    ✕
                </button>

                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4">
                        <FaUsers />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Unirse a una Familia</h3>
                    <p className="text-slate-500 mt-2">
                        Ingresa el código de invitación de 6 caracteres que te compartió el dueño de la mascota.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Ej. AB12CD"
                            maxLength={8}
                            className="w-full text-center text-3xl font-mono font-bold tracking-widest uppercase border-2 border-slate-200 rounded-xl py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-900"
                            required
                        />
                    </div>

                    {message && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-xl text-center text-sm font-bold">
                            ✅ {message}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-center text-sm font-bold">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !code}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verificando...' : (
                            <>
                                Unirse ahora <FaArrowRight />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
