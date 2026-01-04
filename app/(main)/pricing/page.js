'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheck, FaCrown } from 'react-icons/fa';

export default function PricingPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubscribe = async (planId) => {
        setLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId }),
            });

            const data = await response.json();

            if (response.ok && data.url) {
                // Redirect to Stripe checkout
                window.location.href = data.url;
            } else {
                alert('Error al procesar el pago. Por favor, configura las API keys de Stripe en el archivo .env');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Error de conexión. Asegúrate de que las variables de entorno de Stripe estén configuradas.');
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            id: 'free',
            name: 'Gratuito',
            price: 0,
            period: 'siempre',
            features: [
                'Registro de hasta 2 mascotas',
                'Códigos QR básicos',
                'Perfil de mascota',
                'Búsqueda de veterinarios'
            ],
            cta: 'Plan Actual',
            disabled: true
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 149,
            period: 'mes',
            popular: true,
            features: [
                'Mascotas ilimitadas',
                'Actas de propiedad en PDF',
                'Credenciales digitales',
                'Prioridad en búsquedas',
                'Historial médico completo',
                'Recordatorios de vacunas',
                'Soporte prioritario'
            ],
            cta: 'Suscribirse'
        },
        {
            id: 'lifetime',
            name: 'De por Vida',
            price: 2499,
            period: 'único',
            features: [
                'Todo lo de Premium',
                'Pago único',
                'Acceso de por vida',
                'Actualizaciones gratuitas',
                'Certificado físico',
                'Consultas gratuitas (2/año)'
            ],
            cta: 'Comprar'
        }
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Planes y Precios</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Elige el plan perfecto para proteger a tus mascotas</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        style={{
                            background: 'white',
                            padding: '32px 24px',
                            borderRadius: '20px',
                            boxShadow: plan.popular ? '0 12px 40px rgba(28, 119, 195, 0.2)' : 'var(--shadow-md)',
                            border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
                            position: 'relative',
                            transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.3s'
                        }}
                    >
                        {plan.popular && (
                            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaCrown /> Más Popular
                            </div>
                        )}

                        <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{plan.name}</h3>
                        <div style={{ marginBottom: '24px' }}>
                            <span style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)' }}>${plan.price}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>/{plan.period}</span>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                            {plan.features.map((feature, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '14px' }}>
                                    <FaCheck color="var(--success)" size={16} />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={plan.disabled || loading}
                            className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ width: '100%', padding: '12px', opacity: plan.disabled ? 0.5 : 1, cursor: plan.disabled ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Procesando...' : plan.cta}
                        </button>
                    </div>
                ))}
            </div>

            {/* FAQs */}
            <section style={{ marginTop: '60px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>Preguntas Frecuentes</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
                    <details style={{ background: 'white', padding: '20px', borderRadius: '12px', cursor: 'pointer' }}>
                        <summary style={{ fontWeight: 'bold', fontSize: '16px' }}>¿Puedo cambiar de plan después?</summary>
                        <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu cuenta.</p>
                    </details>
                    <details style={{ background: 'white', padding: '20px', borderRadius: '12px', cursor: 'pointer' }}>
                        <summary style={{ fontWeight: 'bold', fontSize: '16px' }}>¿Los documentos son válidos legalmente?</summary>
                        <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Las actas de propiedad son certificados digitales reconocidos como prueba de propiedad en caso de pérdida o robo.</p>
                    </details>
                    <details style={{ background: 'white', padding: '20px', borderRadius: '12px', cursor: 'pointer' }}>
                        <summary style={{ fontWeight: 'bold', fontSize: '16px' }}>¿Qué métodos de pago aceptan?</summary>
                        <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Aceptamos tarjetas de crédito y débito a través de Stripe, la plataforma de pagos más segura.</p>
                    </details>
                </div>
            </section>
        </div>
    );
}
