'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPaw } from 'react-icons/fa';
// import styles from './Login.module.css'; // Inline styles for speed or create module

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Ocurrió un error. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'white' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <Image src="/icon.png" alt="Logo" width={100} height={100} style={{ marginBottom: '16px' }} />
                <h1>Bienvenido</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Inicia sesión para continuar</p>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {error && <div style={{ color: 'var(--error)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                <div className="input-group">
                    <label className="input-label">Email</label>
                    <input
                        type="email"
                        className="input-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="ejemplo@correo.com"
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Contraseña</label>
                    <input
                        type="password"
                        className="input-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                ¿No tienes cuenta? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Regístrate aquí</Link>
            </div>
        </div>
    );
}
