'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaBell } from 'react-icons/fa';

export default function NotificationsPage() {
    const [settings, setSettings] = useState({
        appointments: true,
        vaccineReminders: true,
        promotions: false,
        newsletter: true,
        petActivity: true
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        // TODO: Save to API
    };

    return (
        <div className="min-h-screen bg-background-dark text-white p-6 md:p-10 animate-in fade-in duration-300">
            <div className="max-w-xl mx-auto">
                <Link href="/account" className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors font-medium">
                    <FaArrowLeft /> Volver
                </Link>

                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Notificaciones</h1>

                <div className="bg-surface-dark border border-white/5 p-6 rounded-3xl shadow-2xl space-y-2">
                    <NotificationToggle
                        label="Recordatorios de Citas"
                        description="Recibe notificaciones 24h antes de tus citas"
                        checked={settings.appointments}
                        onChange={() => handleToggle('appointments')}
                    />
                    <NotificationToggle
                        label="Recordatorios de Vacunas"
                        description="Alertas cuando tus mascotas necesiten vacunas"
                        checked={settings.vaccineReminders}
                        onChange={() => handleToggle('vaccineReminders')}
                    />
                    <NotificationToggle
                        label="Promociones"
                        description="Ofertas especiales y descuentos"
                        checked={settings.promotions}
                        onChange={() => handleToggle('promotions')}
                    />
                    <NotificationToggle
                        label="Newsletter"
                        description="Consejos y noticias sobre cuidado de mascotas"
                        checked={settings.newsletter}
                        onChange={() => handleToggle('newsletter')}
                    />
                    <NotificationToggle
                        label="Actividad de Mascota"
                        description="Actualizaciones sobre tus mascotas"
                        checked={settings.petActivity}
                        onChange={() => handleToggle('petActivity')}
                        last
                    />
                </div>
            </div>
        </div>
    );
}

function NotificationToggle({ label, description, checked, onChange, last }) {
    return (
        <div className={`flex justify-between items-center p-4 rounded-xl transition-colors hover:bg-white/5 ${!last ? 'border-b border-white/5' : ''}`}>
            <div>
                <h3 className="font-bold text-sm mb-1 text-white">{label}</h3>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
        </div>
    );
}
