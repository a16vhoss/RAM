'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPaw, FaQrcode, FaShieldAlt, FaMobileAlt, FaArrowRight, FaCheck } from 'react-icons/fa';
import { API_BASE } from '@/app/actions/pet';

export default function LandingPage() {
    const router = useRouter();

    useEffect(() => {
        // Optional: Check session on client side if you want auto-redirect
        // For static mobile capability, it's better to let them click Login
        // But we can check session here if we want similar behavior
        async function checkSession() {
            try {
                const res = await fetch(`${API_BASE || ''}/api/auth/session`, { credentials: 'include' });
                const data = await res.json();
                if (data.session) {
                    router.push('/dashboard');
                }
            } catch (e) {
                // ignore
            }
        }
        checkSession();
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="w-full px-6 md:px-12 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                            <FaPaw className="text-white text-lg" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">RAM</h1>
                            <p className="text-xs text-slate-400">Registro Animal Mundial</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link href="/register" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/30">
                            Registrarse
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 pb-20 px-6">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="w-full text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-8">
                        <FaShieldAlt />
                        Registro oficial para mascotas
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                        La identidad digital de tu
                        <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"> mascota</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Registra, protege y gestiona la información de tus mascotas en un solo lugar.
                        Credenciales digitales, historial médico y sistema de alertas.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 text-lg">
                            Comenzar Ahora
                            <FaArrowRight />
                        </Link>
                        <Link href="/login" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 text-lg">
                            Ya tengo cuenta
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 w-full bg-slate-800/50">
                <div className="w-full px-6 md:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Qué ofrecemos?</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Todo lo que necesitas para mantener a tu mascota segura e identificada</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<FaQrcode className="text-3xl" />}
                            title="Credencial Digital"
                            description="Genera credenciales únicas con código QR para identificar a tu mascota en cualquier momento."
                            color="blue"
                        />
                        <FeatureCard
                            icon={<FaShieldAlt className="text-3xl" />}
                            title="Sistema de Alertas"
                            description="En caso de extravío, activa una alerta para que tu comunidad te ayude a encontrarla."
                            color="red"
                        />
                        <FeatureCard
                            icon={<FaMobileAlt className="text-3xl" />}
                            title="Historial Médico"
                            description="Mantén un registro completo de vacunas, consultas y tratamientos de tu mascota."
                            color="green"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 w-full">
                <div className="w-full px-6 md:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo funciona?</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">En solo 3 pasos tendrás a tu mascota registrada</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <StepCard
                            number="1"
                            title="Crea tu cuenta"
                            description="Regístrate de forma gratuita en menos de un minuto."
                        />
                        <StepCard
                            number="2"
                            title="Registra tu mascota"
                            description="Agrega los datos y foto de tu mascota para generar su perfil."
                        />
                        <StepCard
                            number="3"
                            title="Descarga la credencial"
                            description="Obtén la credencial digital con QR y compártela donde quieras."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-green-600 to-green-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para proteger a tu mascota?</h2>
                    <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">
                        Únete a miles de dueños responsables que ya confían en RAM para mantener a sus mascotas seguras.
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all text-lg shadow-2xl">
                        Crear Mi Cuenta Gratis
                        <FaArrowRight />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-slate-900 border-t border-white/5">
                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <FaPaw className="text-white text-sm" />
                        </div>
                        <span className="font-bold">RAM Registro Animal Mundial</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © 2026 RAM. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }) {
    const colorMap = {
        blue: 'bg-green-500/10 text-green-400 border-green-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
    };

    return (
        <div className="p-8 rounded-2xl bg-slate-800/50 border border-white/5 hover:border-white/10 transition-all group">
            <div className={`w-16 h-16 rounded-2xl ${colorMap[color]} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-slate-400">{description}</p>
        </div>
    );
}

function StepCard({ number, title, description }) {
    return (
        <div className="relative p-8 rounded-2xl bg-slate-800/30 border border-white/5 text-center">
            <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center mx-auto mb-6">
                {number}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-slate-400">{description}</p>
        </div>
    );
}
