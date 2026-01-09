'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight, FaUser, FaStore, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCheck, FaCamera } from 'react-icons/fa';

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
                router.push('/dashboard');
            } else {
                setError(data.error);
                // If error is related to basic info, go back
                if (data.error.includes('email') || data.error.includes('password')) {
                    setStep(1);
                }
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#f6f7f8] dark:bg-[#111a21] font-sans overflow-hidden">

            {/* Desktop Hero Side (Left) */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1554692994-b2e35b7121d9?auto=format&fit=crop&q=80&w=2000"
                        alt="Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-transparent"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <FaCheck className="text-white text-lg" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">RAM</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        La seguridad de tu mascota, <br />
                        <span className="text-blue-400">nuestra prioridad.</span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-8">
                        Únete a miles de dueños responsables que ya gestionan el historial médico y la identidad de sus compañeros peludos con RAM.
                    </p>

                    <div className="flex gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex gap-1 text-yellow-400 text-xs mb-1">
                                {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
                            </div>
                            <span className="text-xs font-medium text-slate-300 mx-1">+10,000 Usuarios felices</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-500">
                    © 2026 Registro Animal Mundial. Todos los derechos reservados.
                </div>
            </div>

            {/* Form Side (Right) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center relative p-6">
                {/* Background Ambient Glow Effects (Mobile/Form Side) */}
                <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-[#2791e7]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

                <div className="w-full max-w-md mx-auto relative z-10 flex flex-col h-full lg:h-auto justify-center">

                    {/* Top App Bar */}
                    <div className="flex items-center justify-between mb-8">
                        {step > 1 ? (
                            <button onClick={() => setStep(step - 1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                                <FaArrowLeft size={18} />
                            </button>
                        ) : (
                            <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                                <FaArrowLeft size={18} />
                            </Link>
                        )}
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-[#2791e7] mb-0.5">Paso {step} de 2</span>
                            <h2 className="text-lg font-bold leading-tight">Crear Cuenta</h2>
                        </div>
                        <div className="w-10"></div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="flex w-full items-center justify-center gap-2 mb-8">
                        <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#2791e7] shadow-lg shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#2791e7] shadow-lg shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center flex items-center justify-center gap-2 animate-shake">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={step === 1 ? handleNext : handleSubmit} className="flex flex-col gap-6">

                        {step === 1 && (
                            <div className="animate-fade-in-up">
                                <div className="mb-8">
                                    <h1 className="text-4xl font-bold leading-[1.1] mb-3 tracking-tight text-slate-900 dark:text-white">
                                        ¡Hola! <br />
                                        <span className="text-[#2791e7]">Empecemos.</span>
                                    </h1>
                                    <p className="text-slate-500 dark:text-[#9dacb8] text-lg font-normal leading-relaxed">
                                        Crea tu perfil para gestionar la salud de tus mascotas.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all shadow-sm">
                                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Nombre</label>
                                            <input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 focus:ring-0 text-base font-semibold"
                                                placeholder="Tu nombre"
                                            />
                                        </div>
                                        <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all shadow-sm">
                                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Apellidos</label>
                                            <input
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 focus:ring-0 text-base font-semibold"
                                                placeholder="Apellidos"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all shadow-sm">
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Correo Electrónico</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 focus:ring-0 text-base font-semibold"
                                            placeholder="ejemplo@correo.com"
                                        />
                                        <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                    </div>

                                    <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all shadow-sm">
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Teléfono</label>
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 focus:ring-0 text-base font-semibold"
                                            placeholder="55 1234 5678"
                                        />
                                        <FaPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                    </div>

                                    <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all shadow-sm">
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Contraseña</label>
                                        <input
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                            className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 focus:ring-0 text-base font-semibold"
                                            placeholder="••••••••"
                                        />
                                        <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in-up">
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold leading-tight mb-2 text-slate-900 dark:text-white">¡Casi listos! {formData.firstName}</h1>
                                    <p className="text-slate-500 dark:text-[#9dacb8] text-base font-normal leading-relaxed">
                                        Completa tu ubicación para finalizar el registro.
                                    </p>
                                </div>

                                {/* Location */}
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">TU UBICACIÓN</label>
                                <div className="flex flex-col gap-4">
                                    <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all shadow-sm">
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Ciudad</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 focus:ring-0 text-base font-semibold"
                                            placeholder="Ej. Ciudad de México"
                                        />
                                        <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                    </div>
                                    <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all shadow-sm">
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Estado</label>
                                        <input
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-300 focus:ring-0 text-base font-semibold"
                                            placeholder="Ej. CDMX"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sticky Bottom Action (Mobile) / Regular Button (Desktop) */}
                        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-[#111a21]/90 backdrop-blur-lg border-t border-slate-100 dark:border-white/5 lg:relative lg:bg-transparent lg:border-none lg:p-0 lg:mt-4 z-20">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full lg:max-w-full h-14 bg-[#2791e7] hover:bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span>Procesando...</span>
                                ) : (
                                    <>
                                        <span>{step === 1 ? 'Siguiente' : 'Completar Registro'}</span>
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
