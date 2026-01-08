'use client';

import { useState, useRef } from 'react';
import { inviteUser, removeUser } from '@/app/actions/family';

export default function CoOwnerInvite({ petId, owners = [], currentUserId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const formRef = useRef(null);

    const handleInvite = async (formData) => {
        setIsLoading(true);
        setMessage(null);
        setError(null);

        const email = formData.get('email');
        if (!email) {
            setError('Ingresa un correo electrónico.');
            setIsLoading(false);
            return;
        }

        const result = await inviteUser(petId, email);

        if (result.success) {
            setMessage(result.message);
            formRef.current?.reset();
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleRemove = async (userId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar a este co-propietario?')) return;

        setIsLoading(true);
        const result = await removeUser(petId, userId);

        if (result.success) {
            setMessage(result.message);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">👨‍👩‍👧‍👦</span> Familia (Co-Propietarios)
            </h3>

            <p className="text-slate-500 text-sm mb-6">
                Comparte la administración de esta mascota con otros miembros de tu familia.
                Podrán ver detalles, editar información y recibir alertas.
            </p>

            {/* List of Owners */}
            <div className="space-y-4 mb-8">
                {owners.map((owner) => (
                    <div key={owner.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xl">
                                {owner.photo_url ? (
                                    <img src={owner.photo_url} alt={owner.first_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                    {owner.first_name} {owner.last_name}
                                    {owner.user_id === currentUserId && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-2">Tú</span>}
                                </p>
                                <p className="text-xs text-slate-500">{owner.email}</p>
                            </div>
                        </div>

                        {/* Remove Action - Only valid for others */}
                        {owner.user_id !== currentUserId && (
                            <button
                                onClick={() => handleRemove(owner.user_id)}
                                disabled={isLoading}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
                                title="Eliminar acceso"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Invite Form */}
            <form ref={formRef} action={handleInvite} className="mt-4 border-t pt-4 border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">Invitar nuevo miembro</label>
                <div className="flex gap-2">
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico del usuario"
                        required
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? '...' : 'Invitar'}
                    </button>
                </div>
            </form>

            {/* Feedback Messages */}
            {message && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
                    ✅ {message}
                </div>
            )}
            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
