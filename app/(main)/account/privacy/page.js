'use client';

import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt, FaTrash, FaDownload } from 'react-icons/fa';

export default function PrivacyPage() {
    const handleDeleteAccount = () => {
        if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            // TODO: Implement account deletion
            alert('Funcionalidad de eliminación en desarrollo');
        }
    };

    const handleExportData = () => {
        // TODO: Implement data export
        alert('Exportación de datos en desarrollo');
    };

    return (
        <div style={{ padding: '20px' }}>
            <Link href="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                <FaArrowLeft /> Volver
            </Link>

            <h1 style={{ marginBottom: '24px' }}>Privacidad</h1>

            <section style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <FaShieldAlt size={24} color="var(--primary)" />
                    <h2 style={{ fontSize: '18px' }}>Datos Personales</h2>
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                    Tus datos están protegidos y nunca serán compartidos con terceros sin tu consentimiento.
                    Solo utilizamos tu información para brindarte un mejor servicio.
                </p>

                <button onClick={handleExportData} className="btn btn-secondary btn-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaDownload /> Descargar Mis Datos
                </button>
            </section>

            <section style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Visibilidad de Perfil</h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '12px' }}>
                    <div>
                        <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>Perfil Público</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Permite que otros usuarios vean tu perfil</p>
                    </div>
                    <input type="checkbox" style={{ width: '20px', height: '20px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <div>
                        <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>Mostrar Email</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Visible en información de QR de mascotas</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
                </div>
            </section>

            <section style={{ background: '#FFF5F5', padding: '20px', borderRadius: '16px', border: '1px solid #FFC9C9', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--error)' }}>Zona de Peligro</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, estate seguro.
                </p>
                <button onClick={handleDeleteAccount} className="btn" style={{ width: '100%', background: 'var(--error)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaTrash /> Eliminar Cuenta
                </button>
            </section>
        </div>
    );
}
