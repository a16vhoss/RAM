'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaArrowRight, FaGoogle, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        <div style={{
            minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            background: 'var(--background-dark)'
        }}>
            {/* Background Decorative Elements */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{
                    position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px',
                    background: 'rgba(39, 145, 231, 0.2)', borderRadius: '50%', filter: 'blur(100px)'
                }}></div>
                <div style={{
                    position: 'absolute', bottom: '-10%', left: '-20%', width: '400px', height: '400px',
                    background: 'rgba(30, 64, 175, 0.1)', borderRadius: '50%', filter: 'blur(80px)'
                }}></div>
            </div>

            {/* Main Content Wrapper */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>

                {/* Hero / Image Section */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
                    {/* Glowing Ring */}
                    <div style={{
                        position: 'absolute', width: '256px', height: '256px',
                        border: '1px solid rgba(39, 145, 231, 0.3)', borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }}></div>

                    <div style={{ position: 'relative', width: '100%', maxWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '180px', height: '180px', borderRadius: '40px',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            boxShadow: '0 0 60px rgba(59, 130, 246, 0.4)',
                            border: '3px solid rgba(255, 255, 255, 0.1)',
                            padding: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <img src="/logo_transparent.png" alt="RAM Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>RAM</h2>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>Registro Animal Mundial</p>
                        </div>

                        {/* Floating Badge */}
                        <div style={{
                            background: 'rgba(17, 26, 33, 0.9)', backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}>
                            <span style={{ color: 'var(--primary)', fontSize: '20px' }}>✓</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>ID Oficial</span>
                        </div>
                    </div>
                </div>

                {/* Login Form Section (Bottom Sheet) */}
                <div className="glass-panel" style={{
                    width: '100%', borderTopLeftRadius: '40px', borderTopRightRadius: '40px',
                    padding: '32px', paddingBottom: '40px', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
                    animation: 'slideUp 0.5s ease-out'
                }}>
                    {/* Handle Bar */}
                    <div style={{ width: '48px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', margin: '0 auto 32px' }}></div>

                    <div style={{ maxWidth: '448px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>Welcome Back</h1>
                            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Log in to manage your pet&apos;s digital life</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {error && <div style={{ color: '#ef4444', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}

                            {/* Email */}
                            <div className="group">
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px', paddingLeft: '4px' }}>Email Address</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '18px' }}><FaEnvelope /></span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="hello@example.com"
                                        style={{
                                            width: '100%', background: '#1c252e', border: '1px solid transparent',
                                            color: 'white', borderRadius: '12px', padding: '16px 16px 16px 48px',
                                            fontSize: '16px', outline: 'none', transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(39, 145, 231, 0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', paddingLeft: '4px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#94a3b8' }}>Password</label>
                                    <Link href="/forgot-password" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--primary)' }}>Forgot?</Link>
                                </div>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '18px' }}><FaLock /></span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%', background: '#1c252e', border: '1px solid transparent',
                                            color: 'white', borderRadius: '12px', padding: '16px 48px 16px 48px',
                                            fontSize: '16px', outline: 'none', transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(39, 145, 231, 0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '16px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: '16px', width: '100%', background: 'var(--primary)',
                                    color: 'white', fontWeight: '600', padding: '16px', borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(39, 145, 231, 0.4)', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontSize: '16px', transition: 'transform 0.1s'
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {loading ? 'Logging in...' : 'Log In'} <FaArrowRight />
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', margin: '24px 0' }}>
                            <div style={{ flexGrow: 1, borderTop: '1px solid #334155' }}></div>
                            <span style={{ flexShrink: 0, margin: '0 16px', color: '#64748b', fontSize: '14px' }}>Or continue with</span>
                            <div style={{ flexGrow: 1, borderTop: '1px solid #334155' }}></div>
                        </div>

                        {/* Social Login */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button style={{
                                background: '#1c252e', border: '1px solid rgba(51, 65, 85, 0.5)',
                                color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}>
                                <FaGoogle /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Google</span>
                            </button>
                            <button style={{
                                background: '#1c252e', border: '1px solid rgba(51, 65, 85, 0.5)',
                                color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}>
                                <FaApple /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Apple</span>
                            </button>
                        </div>

                        <div style={{ marginTop: '32px', textAlign: 'center' }}>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                Don&apos;t have an account?
                                <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '700', marginLeft: '4px' }}>Sign Up</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
