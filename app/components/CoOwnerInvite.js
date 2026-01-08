'use client';

import { useState, useEffect } from 'react';
import { createInvite, removeUser, getActiveInvite } from '@/app/actions/family';
import { FaCopy, FaTrash, FaUserPlus, FaUsers, FaHistory } from 'react-icons/fa';

export default function CoOwnerInvite({ petId, owners = [], currentUserId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [activeInvite, setActiveInvite] = useState(null);

    useEffect(() => {
        const loadActiveInvite = async () => {
            const result = await getActiveInvite(petId);
            if (result.success && result.invite) {
                setActiveInvite(result.invite);
            }
        };

        // Load active invite on mount if exists
        loadActiveInvite();
    }, [petId]);

    const handleCreateInvite = async () => {
        setIsLoading(true);
        setMessage(null);
        setError(null);

        const result = await createInvite(petId);

        if (result.success) {
            setActiveInvite({ code: result.code, expires_at: result.expiresAt });
            setMessage('Código de invitación generado exitosamente.');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleRemove = async (userId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar a este co-propietario?')) return;

        setIsLoading(true);
        // Optimistic update could be done here, but revalidatePath handles it mostly
        const result = await removeUser(petId, userId);

        if (result.success) {
            setMessage(result.message);
            if (onUpdate) onUpdate();
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const copyCode = () => {
        if (activeInvite?.code) {
            navigator.clipboard.writeText(activeInvite.code);
            setMessage('¡Código copiado al portapapeles!');
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl text-blue-500"><FaUsers /></span> Familia (Co-Propietarios)
            </h3>

            <p className="text-slate-500 text-sm mb-6">
                Comparte la administración de esta mascota con otros miembros de tu familia.
                Podrán ver detalles, editar información y recibir alertas.
            </p>

            {/* List of Owners */}
            <div className="space-y-4 mb-8">
                {owners.map((owner) => (
                    <div key={owner.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-hover">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xl shrink-0">
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
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Eliminar acceso"
                            >
                                <FaTrash size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Invite Section */}
            <div className="mt-6 border-t pt-6 border-slate-100">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FaUserPlus className="text-slate-400" /> Invitar nuevo miembro
                </h4>

                {!activeInvite ? (
                    <button
                        onClick={handleCreateInvite}
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                    >
                        Generar Código de Invitación
                    </button>
                ) : (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl animate-fade-in text-center">
                        <p className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-2">Código Activo (24h)</p>
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <span className="text-3xl font-mono font-black text-slate-900 tracking-widest">{activeInvite.code}</span>
                            <button
                                onClick={copyCode}
                                className="bg-white hover:bg-slate-100 text-slate-600 p-2 rounded-lg shadow-sm border border-slate-200 transition-colors"
                                title="Copiar código"
                            >
                                <FaCopy />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Comparte este código con tu familiar. Podrá unirse desde su Dashboard.
                        </p>

                        {/* Option to regenerate? Or just show existing. Keep simple. */}
                    </div>
                )}
            </div>

            {/* Feedback Messages */}
            {message && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in border border-green-100">
                    ✅ {message}
                </div>
            )}
            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in border border-red-100">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
