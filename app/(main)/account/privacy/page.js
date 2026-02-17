'use client';

import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt, FaTrash, FaDownload } from 'react-icons/fa';


import { deleteAccount, exportUserData } from '@/app/actions/user';

export default function PrivacyPage() {
    const handleDeleteAccount = async () => {
        if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción ELIMINARÁ PERMANENTEMENTE todos tus datos y mascotas. No se puede deshacer.')) {
            try {
                const result = await deleteAccount();
                if (!result.success) {
                    alert('Error al eliminar cuenta: ' + result.error);
                }
            } catch (error) {
                console.error(error);
                alert('Ocurrió un error inesperado');
            }
        }
    };

    const handleExportData = async () => {
        try {
            const result = await exportUserData();
            if (result.success) {
                const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ram_user_data_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert('Error al exportar datos: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error al descargar datos');
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white p-6 md:p-10 animate-in fade-in duration-300">
            <div className="max-w-2xl mx-auto">
                <Link href="/account" className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors font-medium">
                    <FaArrowLeft /> Volver
                </Link>

                <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Privacidad</h1>

                <section className="bg-surface-dark border border-white/5 p-6 rounded-3xl mb-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FaShieldAlt size={20} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Datos Personales</h2>
                    </div>

                    <p className="text-gray-400 mb-6 leading-relaxed">
                        Tus datos están protegidos y nunca serán compartidos con terceros sin tu consentimiento.
                        Solo utilizamos tu información para brindarte un mejor servicio.
                    </p>

                    <button onClick={handleExportData} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        <FaDownload /> Descargar Mis Datos
                    </button>
                </section>

                <section className="bg-surface-dark border border-white/5 p-6 rounded-3xl mb-6 shadow-xl space-y-4">
                    <h2 className="text-xl font-bold mb-2">Visibilidad de Perfil</h2>

                    <div className="flex justify-between items-center p-4 bg-green-900/20 rounded-xl border border-white/5">
                        <div>
                            <h3 className="font-bold text-sm mb-1">Perfil Público</h3>
                            <p className="text-xs text-gray-500">Permite que otros usuarios vean tu perfil</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-green-900/20 rounded-xl border border-white/5">
                        <div>
                            <h3 className="font-bold text-sm mb-1">Mostrar Email</h3>
                            <p className="text-xs text-gray-500">Visible en información de QR de mascotas</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </section>

                <section className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <FaTrash className="text-red-500" />
                        <h2 className="text-xl font-bold text-red-500">Zona de Peligro</h2>
                    </div>
                    <p className="text-sm text-red-400/80 mb-6">
                        Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, estate seguro.
                    </p>
                    <button onClick={handleDeleteAccount} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                        Eliminar Cuenta
                    </button>
                </section>
            </div>
        </div>
    );
}
