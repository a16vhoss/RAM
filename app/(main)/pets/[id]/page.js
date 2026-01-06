'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
    FaArrowLeft, FaCheckCircle, FaShieldAlt, FaMicrochip, FaPaw, FaWeight,
    FaVenusMars, FaBirthdayCake, FaIdCard, FaTrash, FaFileAlt, FaChevronRight, FaArrowRight,
    FaPlus, FaNotesMedical, FaSyringe, FaStethoscope, FaPills
} from 'react-icons/fa';
import { deletePet, toggleLostPetStatus } from '@/app/actions/pet';
import { getMedicalRecords } from '@/app/actions/medical';
import DocumentViewerModal from '@/app/(main)/documents/DocumentViewerModal';
import MedicalRecordModal from '../MedicalRecordModal';


export default function PetProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [pet, setPet] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, medical
    const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);

    async function fetchMedicalRecords() {
        const recordsRes = await getMedicalRecords(params.id);
        if (recordsRes.success) {
            setMedicalRecords(recordsRes.data);
        }
    }

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Pet Details
                const res = await fetch(`/api/pets/${params.id}`);

                if (res.ok) {
                    const data = await res.json();
                    setPet(data);

                    // Fetch Medical Records
                    await fetchMedicalRecords();

                    // Generate QR Code
                    const petInfoUrl = `${window.location.origin}/public/pet/${params.id}`;
                    const qr = await QRCode.toDataURL(petInfoUrl, {
                        width: 300,
                        margin: 2,
                        color: { dark: '#000000', light: '#FFFFFF' }
                    });
                    setQrCodeUrl(qr);
                } else {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.id, router]);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar permanentemente a esta mascota? Esta acción no se puede deshacer.')) return;

        setDeleting(true);
        const res = await deletePet(pet.pet_id);
        if (res.success) {
            router.push('/dashboard');
        } else {
            alert('Error al eliminar: ' + res.error);
            setDeleting(false);
        }
    };

    const handleToggleLost = async () => {
        const isLost = pet.status === 'lost';
        const action = isLost ? 'marcar como encontrado' : 'reportar como extraviado';

        if (!confirm(`¿Estás seguro de que deseas ${action}?`)) return;

        const res = await toggleLostPetStatus(pet.pet_id, !isLost);
        if (res.success) {
            setPet({ ...pet, status: res.status });
        } else {
            alert('Error al actualizar estado: ' + res.error);
        }
    };

    const downloadQR = () => {
        if (!qrCodeUrl) return;
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `RAM-${pet.pet_name}-QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getRecordIcon = (type) => {
        const t = type.toLowerCase();
        if (t.includes('vacuna')) return <FaSyringe size={16} />;
        if (t.includes('cirugía') || t.includes('cirugia')) return <FaNotesMedical size={16} />;
        if (t.includes('desparasit')) return <FaPills size={16} />;
        return <FaStethoscope size={16} />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!pet) return null;

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'No esp.';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return `${age} Año${age !== 1 ? 's' : ''}`;
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="min-h-screen bg-background-dark text-white pb-28 overflow-x-hidden relative">
            {/* Background Ambient Glows */}
            <div className="fixed -top-[20%] -left-[10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[10%] -right-[10%] w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

            {/* Top Navigation */}
            <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 animate-slide-up">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                        <FaArrowLeft size={20} />
                    </button>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-full">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('medical')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'medical' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Médico
                        </button>
                    </div>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* LOST PET BANNER */}
            {pet.status === 'lost' && (
                <div className="bg-red-600 px-4 py-3 animate-pulse flex items-center justify-center gap-2 shadow-xl relative z-20">
                    <FaShieldAlt className="text-white animate-bounce" />
                    <span className="text-white font-black tracking-widest uppercase text-sm">¡SE BUSCA! - MODO ALERTA ACTIVO</span>
                </div>
            )}

            {/* Scrollable Content */}
            <div className="relative z-10 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {activeTab === 'overview' && (
                    <>
                        {/* Hero Section */}
                        <div className="px-4 pt-6 flex flex-col items-center animate-fade-in">
                            <div className="relative w-full aspect-[4/5] max-h-[420px] rounded-3xl overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-80 z-10"></div>
                                <img
                                    src={pet.pet_photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000'}
                                    alt={pet.pet_name}
                                    className="w-full h-full object-cover transform scale-100 transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col gap-1 mb-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-primary/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                                            Verificado
                                        </span>
                                    </div>
                                    <h1 className="text-4xl font-bold leading-none drop-shadow-lg">{pet.pet_name}</h1>
                                    <p className="text-lg font-medium text-gray-200 drop-shadow-md flex items-center gap-2">
                                        {pet.breed} <span className="w-1 h-1 rounded-full bg-white"></span> {calculateAge(pet.birth_date)}
                                    </p>

                                    {/* Alert Toggle Button */}
                                    <button
                                        onClick={handleToggleLost}
                                        className={`mt-2 py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 w-max shadow-lg transform active:scale-95 transition-all ${pet.status === 'lost' ? 'bg-white text-red-600' : 'bg-red-600/90 hover:bg-red-600 text-white backdrop-blur-md'}`}
                                    >
                                        {pet.status === 'lost' ? '✅ Marcar Encontrado' : '🚨 Reportar Extravío'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status Chips */}
                        <div className="no-scrollbar flex w-full overflow-x-auto gap-3 px-4 -my-2 snap-x animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="pl-1"></div>
                            <div className="snap-center h-9 flex-shrink-0 flex items-center gap-2 rounded-full bg-slate-800/60 border border-white/5 pl-3 pr-4 border-l-4 border-l-green-500">
                                <FaCheckCircle className="text-green-400" size={16} />
                                <span className="text-sm font-medium">Vacunado</span>
                            </div>
                            <div className="snap-center h-9 flex-shrink-0 flex items-center gap-2 rounded-full bg-slate-800/60 border border-white/5 pl-3 pr-4 border-l-4 border-l-primary">
                                <FaShieldAlt className="text-primary" size={16} />
                                <span className="text-sm font-medium">Registrado</span>
                            </div>
                            {pet.microchip_number && (
                                <div className="snap-center h-9 flex-shrink-0 flex items-center gap-2 rounded-full bg-slate-800/60 border border-white/5 pl-3 pr-4 border-l-4 border-l-purple-500">
                                    <FaMicrochip className="text-purple-400" size={16} />
                                    <span className="text-sm font-medium">Chip Activo</span>
                                </div>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="px-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard icon={<FaPaw size={20} />} color="blue" label="Especie" value={pet.species} />
                                <StatCard icon={<FaWeight size={20} />} color="orange" label="Peso" value={pet.weight ? `${pet.weight}kg` : 'N/A'} />
                                <StatCard icon={<FaVenusMars size={20} />} color="pink" label="Sexo" value={pet.sex} />
                                <StatCard icon={<FaBirthdayCake size={20} />} color="yellow" label="Cumpleaños" value={formatDateShort(pet.birth_date)} />
                            </div>
                        </div>

                        {/* Digital ID Card Section */}
                        <div className="px-4 mt-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -translate-x-10 translate-y-10 pointer-events-none"></div>

                                <div className="relative p-6 flex flex-col gap-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-2 text-white/80">
                                                <FaIdCard size={20} />
                                                <span className="text-xs font-bold uppercase tracking-widest">ID Digital Oficial</span>
                                            </div>
                                            <h3 className="text-white text-3xl font-bold tracking-tight">MX-{pet.pet_id ? pet.pet_id.substring(0, 5).toUpperCase() : '00000'}</h3>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center justify-center gap-4 border border-white/5">
                                        <div className="bg-white p-2 rounded-xl shadow-lg transform transition-transform group-hover:scale-105">
                                            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />}
                                        </div>
                                        <button onClick={downloadQR} className="px-4 py-2 bg-black/30 hover:bg-black/50 rounded-full text-xs font-bold text-white flex items-center gap-2 transition-colors uppercase tracking-wide backdrop-blur-md">
                                            Descargar QR
                                        </button>
                                    </div>
                                </div>

                                <div onClick={() => router.push('/documents')} className="relative bg-black/20 backdrop-blur-sm p-3 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors">
                                    <span className="text-white text-xs font-bold tracking-wider flex items-center gap-2">
                                        VER DOCS COMPLETOS <FaArrowRight size={12} />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="px-4">
                            <h3 className="text-lg font-bold text-white mb-4 px-1">Documentos</h3>
                            <div className="flex flex-col gap-3">
                                {pet.documents && pet.documents.length > 0 ? pet.documents.map((doc) => (
                                    <div
                                        key={doc.document_id}
                                        onClick={() => setSelectedDoc({ ...doc, pet_name: pet.pet_name })}
                                        className="group bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-white/5 cursor-pointer hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${doc.document_type.includes('Acta') ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            <FaFileAlt size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold text-base group-hover:text-primary transition-colors">{doc.document_type}</p>
                                            <p className="text-slate-400 text-sm">Emitido: {formatDateShort(doc.issued_at || doc.created_at)}</p>
                                        </div>
                                        <FaChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={12} />
                                    </div>
                                )) : (
                                    <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl">
                                        <p className="text-slate-500 text-sm">No hay documentos registrados.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'medical' && (
                    <div className="px-4 flex flex-col gap-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Historial Clínico</h3>
                            <button
                                onClick={() => setIsMedicalModalOpen(true)}
                                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary-hover transition-colors"
                            >
                                <FaPlus size={14} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 relative">
                            {/* Timeline Line */}
                            <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-white/10"></div>

                            {medicalRecords.length > 0 ? medicalRecords.map((record, index) => (
                                <div key={record.record_id || index} className="pl-14 relative group">
                                    <div className="absolute left-3 top-4 w-4 h-4 rounded-full bg-slate-900 border-2 border-primary z-10 box-content"></div>
                                    <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex flex-col gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span className="text-primary">{getRecordIcon(record.record_type)}</span>
                                                <h4 className="font-bold text-white text-lg">{record.record_type}</h4>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2 py-1 rounded-md">{formatDateShort(record.date)}</span>
                                        </div>
                                        <p className="text-slate-300 text-sm">{record.description}</p>
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                            <FaStethoscope className="text-slate-500" size={12} />
                                            <span className="text-xs text-slate-500 font-medium">{record.vet_name || 'Veterinario General'}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 mx-auto w-full">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                                        <FaNotesMedical size={32} />
                                    </div>
                                    <h4 className="text-white font-bold mb-2">Sin historial médico</h4>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Esta mascota aún no tiene registros médicos. Agrega un evento con el botón +.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Delete Area */}
                {activeTab === 'overview' && (
                    <div className="mt-4 px-4 mb-4">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="w-full py-4 rounded-xl border border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {deleting ? 'Eliminando...' : <><FaTrash /> Eliminar Mascota</>}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-2">Esta acción eliminará todos los datos.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <DocumentViewerModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />

            <MedicalRecordModal
                petId={pet.pet_id}
                isOpen={isMedicalModalOpen}
                onClose={() => setIsMedicalModalOpen(false)}
                onRecordAdded={fetchMedicalRecords}
            />
        </div>
    );
}

function StatCard({ icon, color, label, value }) {
    const colorMap = {
        blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
        orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
        pink: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
        yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' }
    };
    const theme = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-3 border border-white/5 hover:bg-slate-800 transition-colors group">
            <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text}`}>
                    {icon}
                </div>
                <span className="text-xs text-slate-400 font-medium">{label}</span>
            </div>
            <p className="text-white text-xl font-bold group-hover:scale-105 transition-transform origin-left">{value}</p>
        </div>
    );
}
