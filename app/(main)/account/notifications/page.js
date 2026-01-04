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
        <div style={{ padding: '20px' }}>
            <Link href="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                <FaArrowLeft /> Volver
            </Link>

            <h1 style={{ marginBottom: '24px' }}>Notificaciones</h1>

            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
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
    );
}

function NotificationToggle({ label, description, checked, onChange, last }) {
    return (
        <div style={{ paddingBottom: last ? 0 : '16px', marginBottom: last ? 0 : '16px', borderBottom: last ? 'none' : '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{label}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{description}</p>
                </div>
                <label style={{ display: 'block', position: 'relative', width: '50px', height: '28px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: checked ? 'var(--primary)' : '#ccc',
                        borderRadius: '28px',
                        transition: '0.4s'
                    }}>
                        <span style={{
                            position: 'absolute',
                            content: '',
                            height: '20px',
                            width: '20px',
                            left: checked ? '26px' : '4px',
                            bottom: '4px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: '0.4s'
                        }}></span>
                    </span>
                </label>
            </div>
        </div>
    );
}
