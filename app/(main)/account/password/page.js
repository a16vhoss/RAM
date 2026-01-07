'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';


import { changePassword } from '@/app/actions/user';

export default function PasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const result = await changePassword(formData.currentPassword, formData.newPassword);
            if (result.success) {
                alert('Contraseña actualizada exitosamente');
                router.push('/account');
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white p-6 md:p-10 animate-in fade-in duration-300">
            <div className="max-w-xl mx-auto">
                <Link href="/account" className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors font-medium">
                    <FaArrowLeft /> Volver
                </Link>

                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Cambiar Contraseña</h1>

                <form onSubmit={handleSubmit} className="bg-surface-dark border border-white/5 p-6 md:p-8 rounded-3xl shadow-2xl">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Contraseña Actual</label>
                            <input
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                type="password"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                            <input
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                required
                                minLength={8}
                                placeholder="Mínimo 8 caracteres"
                            />
                            <p className="text-xs text-gray-500 ml-1">Debe incluir números y símbolos.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Confirmar Nueva Contraseña</label>
                            <input
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                placeholder="Repite la nueva contraseña"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaLock /> {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}
