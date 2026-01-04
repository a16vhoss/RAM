'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement update API
        setTimeout(() => {
            alert('Perfil actualizado exitosamente');
            router.push('/account');
        }, 1000);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Link href="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                <FaArrowLeft /> Volver
            </Link>

            <h1 style={{ marginBottom: '24px' }}>Editar Perfil</h1>

            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <div className="input-group">
                    <label className="input-label">Nombre</label>
                    <input
                        className="input-control"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Apellido</label>
                    <input
                        className="input-control"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Teléfono</label>
                    <input
                        className="input-control"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Dirección</label>
                    <textarea
                        className="input-control"
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
}
