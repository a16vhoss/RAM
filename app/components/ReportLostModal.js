'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaBroadcastTower, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function ReportLostModal({ isOpen, onClose, onConfirm, petName }) {
    const [step, setStep] = useState(1);
    const [location, setLocation] = useState(null);
    const [radius, setRadius] = useState(3); // km
    const [message, setMessage] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const getLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("No pudimos obtener tu ubicación. Por favor asegúrate de dar permisos.");
                    setLoadingLocation(false);
                }
            );
        } else {
            alert("La geolocalización no es soportada por este navegador.");
            setLoadingLocation(false);
        }
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        await onConfirm({ location, radius, message });
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-green-950 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
                {/* Header */}
                <div className="p-6 bg-red-600/10 border-b border-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg animate-pulse">
                            <FaExclamationTriangle size={18} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Reportar Extravío</h3>
                            <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">Alerta RAM</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">
                    {step === 1 && (
                        <div className="flex flex-col gap-4 animate-slide-up">
                            <p className="text-slate-300 text-sm">
                                Para activar la alerta y notificar a los vecinos, necesitamos la ubicación donde se vio por última vez a <strong className="text-white">{petName}</strong>.
                            </p>

                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">1. Ubicación del Reporte</label>
                                <button
                                    onClick={getLocation}
                                    className={`w-full py-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${location ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                >
                                    {loadingLocation ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : location ? (
                                        <>
                                            <FaMapMarkerAlt /> Ubicación Detectada
                                        </>
                                    ) : (
                                        <>
                                            <FaMapMarkerAlt /> Usar mi Ubicación Actual
                                        </>
                                    )}
                                </button>
                            </div>

                            {location && (
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all mt-2"
                                >
                                    Continuar
                                </button>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-5 animate-slide-up">
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">2. Radio de Alerta</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 3, 5].map((km) => (
                                        <button
                                            key={km}
                                            onClick={() => setRadius(km)}
                                            className={`py-2 rounded-xl text-sm font-bold border transition-all ${radius === km ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                        >
                                            {km} km
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">Se notificará a los usuarios dentro de este radio.</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">3. Mensaje (Opcional)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={`Ayúdanos a encontrar a ${petName}...`}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors h-24 resize-none"
                                />
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={submitting}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                            >
                                {submitting ? 'Enviando Alerta...' : <><FaBroadcastTower /> ACTIVAR ALERTA RAM</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
