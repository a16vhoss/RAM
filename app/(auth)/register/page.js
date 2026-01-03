'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaStore, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('tutor');
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '',
        phone: '', country: 'México', city: '', state: '',
        businessName: '', providerType: 'Veterinario'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role }),
            });

            const data = await res.json();
            if (res.ok) {
                // Redirect to onboarding or dashboard
                router.push('/dashboard');
            } else {
                setError(data.error);
                setStep(1); // Go back to fix
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Role Selection & Basic Info
    const renderStep1 = () => (
        <>
            <h2 style={{ marginBottom: '20px' }}>Crear Cuenta</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div
                    onClick={() => setRole('tutor')}
                    style={{
                        flex: 1, padding: '15px', border: `2px solid ${role === 'tutor' ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: role === 'tutor' ? '#F0F7FC' : 'white'
                    }}
                >
                    <FaUser size={24} color={role === 'tutor' ? 'var(--primary)' : 'gray'} />
                    <div style={{ marginTop: '5px', fontWeight: '600' }}>Tutor</div>
                </div>
                <div
                    onClick={() => setRole('provider')}
                    style={{
                        flex: 1, padding: '15px', border: `2px solid ${role === 'provider' ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: role === 'provider' ? '#F0F7FC' : 'white'
                    }}
                >
                    <FaStore size={24} color={role === 'provider' ? 'var(--primary)' : 'gray'} />
                    <div style={{ marginTop: '5px', fontWeight: '600' }}>Proveedor</div>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Nombre</label>
                <input name="firstName" className="input-control" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label className="input-label">Apellidos</label>
                <input name="lastName" className="input-control" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label className="input-label">Email</label>
                <input name="email" type="email" className="input-control" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label className="input-label">Contraseña</label>
                <input name="password" type="password" className="input-control" value={formData.password} onChange={handleChange} required minLength={8} />
            </div>

            <button onClick={handleNext} className="btn btn-primary btn-block">
                Siguiente <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>
        </>
    );

    // Step 2: Location & Contact
    const renderStep2 = () => (
        <>
            <h2 style={{ marginBottom: '20px' }}>Tu Ubicación</h2>

            {role === 'provider' && (
                <div className="input-group">
                    <label className="input-label">Nombre del Negocio</label>
                    <input name="businessName" className="input-control" value={formData.businessName} onChange={handleChange} required />
                </div>
            )}

            <div className="input-group">
                <label className="input-label">Celular (+52)</label>
                <input name="phone" type="tel" className="input-control" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label className="input-label">Ciudad</label>
                <input name="city" className="input-control" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="input-group">
                <label className="input-label">Estado</label>
                <input name="state" className="input-control" value={formData.state} onChange={handleChange} required />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                    <FaArrowLeft /> Atrás
                </button>
                <button onClick={handleSubmit} className="btn btn-success" style={{ flex: 2 }} disabled={loading}>
                    {loading ? 'Creando...' : 'Finalizar Registro'}
                </button>
            </div>
        </>
    );

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: 'white' }}>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '30px' }}>
                    <div style={{ flex: 1, height: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                    <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--primary)' : '#eee', borderRadius: '2px' }}></div>
                </div>

                {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}

                <form>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--primary)' }}>Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
}
