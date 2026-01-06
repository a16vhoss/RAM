'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaUserCircle, FaCog, FaChevronRight, FaPaw, FaFileAlt, FaArrowLeft, FaEdit,
    FaLock, FaBell, FaShieldAlt, FaCrown, FaSignOutAlt
} from 'react-icons/fa';
import LogoutButton from '@/components/auth/LogoutButton';

export default function AccountClient({ user, pets = [], documents = [] }) {
    const [view, setView] = useState('profile'); // 'profile' | 'settings'

    if (view === 'settings') {
        return (
            <SettingsView
                user={user}
                onBack={() => setView('profile')}
            />
        );
    }

    return (
        <ProfileView
            user={user}
            pets={pets}
            documents={documents}
            onOpenSettings={() => setView('settings')}
        />
    );
}

function ProfileView({ user, pets, documents, onOpenSettings }) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background text-text-main pb-24 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            {/* Header & User Info */}
            <div className="relative px-6 pt-8 pb-6 bg-gradient-to-b from-surface/50 to-transparent">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold">Mi Perfil</h1>
                        <button
                            onClick={onOpenSettings}
                            className="p-2 rounded-full bg-surface-dark border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <FaCog size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full bg-surface-dark border-4 border-surface flex items-center justify-center overflow-hidden shadow-xl">
                                {user.photo ? (
                                    <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <FaUserCircle size={64} className="text-gray-500" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-background"></div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{user.first_name} {user.last_name}</h2>
                        <p className="text-sm text-gray-400 mb-2">{user.email}</p>
                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                            Usuario Verificado
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-5 space-y-8 max-w-7xl mx-auto w-full">

                {/* Pets Section */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaPaw className="text-primary" /> Mis Mascotas
                        </h3>
                        {pets.length > 0 && (
                            <Link href="/pets/new" className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                                + Agregar
                            </Link>
                        )}
                    </div>

                    {pets.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {pets.map(pet => (
                                <div
                                    key={pet.pet_id}
                                    onClick={() => router.push(`/pets/${pet.pet_id}`)}
                                    className="bg-surface-dark/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-gray-700 overflow-hidden shrink-0">
                                        {pet.pet_photo ? (
                                            <img src={pet.pet_photo} alt={pet.pet_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <FaPaw />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white text-lg">{pet.pet_name}</h4>
                                        <p className="text-sm text-gray-400">{pet.breed || 'Sin raza'} • {calculateAge(pet.birth_date)}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <FaChevronRight size={12} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-surface-dark/30 rounded-2xl border border-dashed border-white/10">
                            <p className="text-gray-400 mb-4">No tienes mascotas registradas.</p>
                            <Link href="/pets/new" className="btn btn-primary inline-flex">Registrar Mascota</Link>
                        </div>
                    )}
                </section>

                {/* Documents Summary */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaFileAlt className="text-blue-400" /> Documentos
                        </h3>
                        <Link href="/documents" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                            Ver todos
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div
                            onClick={() => router.push('/documents')}
                            className="bg-gradient-to-br from-surface-dark to-surface border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-colors"
                        >
                            <span className="text-3xl font-bold text-white block mb-1">{documents.length}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total Docs</span>
                        </div>
                        <div
                            onClick={() => router.push('/documents')}
                            className="bg-gradient-to-br from-surface-dark to-surface border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-colors"
                        >
                            <span className="text-3xl font-bold text-white block mb-1">
                                {documents.filter(d => d.document_type.includes('Vacuna')).length}
                            </span>
                            <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Vacunas</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function SettingsView({ user, onBack }) {
    return (
        <div className="min-h-screen bg-background text-text-main pb-24 animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Configuración</h1>
            </div>

            <div className="p-5 max-w-2xl mx-auto space-y-6">

                {/* Premium Card */}
                <section>
                    <div className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>

                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <FaCrown size={20} />
                                </div>
                                <span className="text-lg font-bold">Pasar a Premium</span>
                            </div>
                            <span className="text-2xl font-bold">$149<span className="text-sm font-normal opacity-80">/mes</span></span>
                        </div>
                        <p className="relative z-10 text-sm opacity-90 mb-6 leading-relaxed">
                            Accede a beneficios exclusivos: actas ilimitadas, descuentos en veterinarias y almacenamiento seguro en la nube.
                        </p>
                        <Link
                            href="/pricing"
                            className="relative z-10 w-full py-3.5 px-4 rounded-xl bg-white text-primary font-bold text-center block hover:bg-opacity-95 transition-all shadow-md active:scale-[0.98]"
                        >
                            Ver Planes Premium
                        </Link>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Cuenta</h3>
                    <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                        <Link href="/account/edit" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <FaEdit size={14} />
                                </div>
                                <span className="font-medium text-gray-200">Editar Perfil</span>
                            </div>
                            <FaChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                        </Link>
                        <Link href="/account/password" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                                    <FaLock size={14} />
                                </div>
                                <span className="font-medium text-gray-200">Cambiar Contraseña</span>
                            </div>
                            <FaChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                        </Link>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Preferencias</h3>
                    <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                        <Link href="/account/notifications" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <FaBell size={14} />
                                </div>
                                <span className="font-medium text-gray-200">Notificaciones</span>
                            </div>
                            <FaChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                        </Link>
                        <Link href="/account/privacy" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                                    <FaShieldAlt size={14} />
                                </div>
                                <span className="font-medium text-gray-200">Privacidad</span>
                            </div>
                            <FaChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                        </Link>
                    </div>
                </section>

                <div className="pt-4">
                    <LogoutButton />
                    <p className="text-center text-xs text-gray-600 mt-4">Versión 1.0.0 • RAM App</p>
                </div>
            </div>
        </div>
    );
}

function calculateAge(birthDate) {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age + ' años';
}
