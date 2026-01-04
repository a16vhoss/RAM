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
        <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden bg-[#f6f7f8] dark:bg-[#111a21] text-slate-900 dark:text-white font-sans">
            {/* Background Ambient Glow Effects */}
            <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-[#2791e7]/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col h-full grow p-6">

                {/* Top App Bar */}
                <div className="flex items-center justify-between mb-6">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                            <FaArrowLeft size={20} />
                        </button>
                    ) : (
                        <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                            <FaArrowLeft size={20} />
                        </Link>
                    )}
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold tracking-widest uppercase text-[#2791e7] mb-0.5">Paso {step} de 2</span>
                        <h2 className="text-xl font-bold leading-tight">Crear Cuenta</h2>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Progress Indicators */}
                <div className="flex w-full items-center justify-center gap-2 mb-8">
                    <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-[#2791e7] shadow-lg shadow-blue-500/30' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-[#2791e7] shadow-lg shadow-blue-500/30' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                </div>

                {error && (
                    <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={step === 1 ? handleNext : handleSubmit} className="flex flex-col gap-5 pb-24 h-full">

                    {step === 1 && (
                        <>
                            <div className="mb-4">
                                <h1 className="text-3xl font-bold leading-[1.1] mb-2 tracking-tight">
                                    ¡Hola! <br />
                                    <span className="text-[#2791e7]">Empecemos.</span>
                                </h1>
                                <p className="text-slate-500 dark:text-[#9dacb8] text-base font-normal leading-relaxed">
                                    Crea tu perfil para gestionar la salud de tus mascotas.
                                </p>
                            </div>

                            {/* Inputs Step 1 */}
                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all">
                                <label className="block text-xs font-medium text-slate-500 dark:text-[#9dacb8] mb-1">Nombre</label>
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-lg font-medium"
                                    placeholder="Tu nombre"
                                />
                                <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all">
                                <label className="block text-xs font-medium text-slate-500 dark:text-[#9dacb8] mb-1">Apellidos</label>
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-lg font-medium"
                                    placeholder="Tus apellidos"
                                />
                            </div>

                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all">
                                <label className="block text-xs font-medium text-slate-500 dark:text-[#9dacb8] mb-1">Correo Electrónico</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-lg font-medium"
                                    placeholder="hola@ejemplo.com"
                                />
                                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all">
                                <div className="flex items-center gap-2 border-b border-transparent mb-1">
                                    <span className="text-slate-900 dark:text-white font-medium">+52</span>
                                </div>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-lg font-medium"
                                    placeholder="Número de celular"
                                />
                                <FaPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent transition-all">
                                <label className="block text-xs font-medium text-slate-500 dark:text-[#9dacb8] mb-1">Contraseña</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-lg font-medium"
                                    placeholder="••••••••"
                                />
                                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold leading-tight mb-2">¡Casi listos!</h1>
                                <p className="text-slate-500 dark:text-[#9dacb8] text-sm font-normal leading-relaxed">
                                    Personaliza tu experiencia seleccionando tu rol y ubicación.
                                </p>
                            </div>

                            {/* Role Selection */}
                            <h3 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tu Rol</h3>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div
                                    onClick={() => setRole('tutor')}
                                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${role === 'tutor'
                                            ? 'bg-white dark:bg-[#1c262e] border-[#2791e7] shadow-lg shadow-blue-500/10'
                                            : 'bg-white/50 dark:bg-[#1c262e]/50 border-transparent hover:border-[#2791e7]/50'
                                        }`}
                                >
                                    {role === 'tutor' && (
                                        <div className="absolute top-2 right-2 bg-[#2791e7] rounded-full p-1">
                                            <FaCheck size={10} color="white" />
                                        </div>
                                    )}
                                    <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 flex items-center justify-center">
                                        <FaUser size={32} className={role === 'tutor' ? 'text-[#2791e7]' : 'text-slate-400'} />
                                    </div>
                                    <p className={`text-sm font-bold ${role === 'tutor' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Tutor / Dueño</p>
                                </div>

                                <div
                                    onClick={() => setRole('provider')}
                                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${role === 'provider'
                                            ? 'bg-white dark:bg-[#1c262e] border-[#2791e7] shadow-lg shadow-blue-500/10'
                                            : 'bg-white/50 dark:bg-[#1c262e]/50 border-transparent hover:border-[#2791e7]/50'
                                        }`}
                                >
                                    {role === 'provider' && (
                                        <div className="absolute top-2 right-2 bg-[#2791e7] rounded-full p-1">
                                            <FaCheck size={10} color="white" />
                                        </div>
                                    )}
                                    <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 flex items-center justify-center">
                                        <FaStore size={32} className={role === 'provider' ? 'text-[#2791e7]' : 'text-slate-400'} />
                                    </div>
                                    <p className={`text-sm font-bold ${role === 'provider' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Proveedor</p>
                                </div>
                            </div>

                            {/* Provider Business Name */}
                            <div className={`transition-all duration-300 overflow-hidden ${role === 'provider' ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-[#9dacb8] mb-1">Nombre del Negocio</label>
                                    <input
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        required={role === 'provider'}
                                        className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-lg font-medium"
                                        placeholder="Ej. Veterinaria Huellitas"
                                    />
                                    <FaStore className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Location */}
                            <h3 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Ubicación</h3>
                            <div className="flex flex-col gap-4">
                                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-[#9dacb8] mb-1">Ciudad</label>
                                    <input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-lg font-medium"
                                        placeholder="Ej. Ciudad de México"
                                    />
                                    <FaMapMarkerAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 relative focus-within:ring-2 focus-within:ring-[#2791e7] focus-within:border-transparent">
                                    <label className="block text-xs font-medium text-slate-500 dark:text-[#9dacb8] mb-1">Estado</label>
                                    <input
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-lg font-medium"
                                        placeholder="Ej. CDMX"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Sticky Bottom Action */}
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f6f7f8] via-[#f6f7f8]/95 to-transparent dark:from-[#111a21] dark:via-[#111a21]/95 z-20 max-w-md mx-auto">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-[#2791e7] hover:bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span>Procesando...</span>
                            ) : (
                                <>
                                    <span>{step === 1 ? 'Siguiente' : 'Finalizar Registro'}</span>
                                    <FaArrowRight />
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
