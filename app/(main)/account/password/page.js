'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

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
        // TODO: Implement password change API
        setTimeout(() => {
            alert('Contraseña actualizada exitosamente');
            router.push('/account');
        }, 1000);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Link href="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                <FaArrowLeft /> Volver
            </Link>

            <h1 style={{ marginBottom: '24px' }}>Cambiar Contraseña</h1>

            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <div className="input-group">
                    <label className="input-label">Contraseña Actual</label>
                    <input
                        className="input-control"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Nueva Contraseña</label>
                    <input
                        className="input-control"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        required
                        minLength={8}
                    />
                    <small style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mínimo 8 caracteres</small>
                </div>

                <div className="input-group">
                    <label className="input-label">Confirmar Nueva Contraseña</label>
                    <input
                        className="input-control"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaLock /> {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
            </form>
        </div>
    );
}
