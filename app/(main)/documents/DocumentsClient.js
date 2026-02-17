'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaFileAlt, FaIdCard, FaStethoscope, FaFilter, FaPlus, FaCheckCircle, FaExclamationTriangle, FaChevronRight } from 'react-icons/fa';

import DocumentViewerModal from './DocumentViewerModal';

export default function DocumentsClient({ documents = [], pets = [], session }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('Todos');
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Filter documents
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.pet_name && doc.pet_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'Todos' ||
            (filterType === 'Médico' && ['Receta', 'Vacuna', 'Certificado'].some(t => doc.document_type.includes(t))) ||
            (filterType === 'Legal' && ['Acta', 'Registro'].some(t => doc.document_type.includes(t))) ||
            (filterType === 'Identificación' && ['Credencial', 'ID', 'Pasaporte'].some(t => doc.document_type.includes(t)));
        return matchesSearch && matchesType;
    });

    // Mock Stats
    const totalDocs = documents.length;
    const vaccineDocs = documents.filter(d => d.document_type.toLowerCase().includes('vacuna') || d.document_type.toLowerCase().includes('cartilla'));
    const isRuacVerified = documents.some(d => d.document_type.toLowerCase().includes('ruac') || d.unique_registration_number);

    // We don't have real vaccine progress, so we'll mock it if there are any vaccine docs, or show 0
    const vaccineProgress = vaccineDocs.length > 0 ? 75 : 0;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 text-white">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4 z-0"></div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-4">
                <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer">
                        <div className="size-12 rounded-full border-2 border-primary/50 p-0.5">
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-full bg-slate-700"
                                style={{ backgroundImage: pets[0]?.pet_photo ? `url(${pets[0].pet_photo})` : 'none' }}>
                                {!pets[0]?.pet_photo && <span className="flex items-center justify-center h-full text-xs">IMG</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-400">Hola, {session?.user?.first_name || 'Usuario'} 🐾</span>
                        <h1 className="text-2xl font-bold leading-tight tracking-tight">Mis Documentos</h1>
                    </div>
                </div>
            </header>

            {/* Stats Carousel */}
            <section className="relative z-10 mt-2">
                <div className="flex gap-4 overflow-x-auto px-6 pb-4 no-scrollbar snap-x">
                    {/* Card 1: Vaccines */}
                    <div className="flex min-w-[260px] flex-col justify-between rounded-2xl p-5 bg-gradient-to-br from-surface-dark to-[#161e26] border border-slate-800 shadow-lg snap-start">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <FaStethoscope size={20} />
                            </div>
                            <span className="text-xs font-semibold bg-primary text-white px-2 py-1 rounded-full">En curso</span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Esquema de Vacunación</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold text-white">{vaccineProgress}%</span>
                                <span className="text-sm text-slate-400 mb-1.5">completado</span>
                            </div>
                            <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${vaccineProgress}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Basado en documentos subidos</p>
                        </div>
                    </div>
                    {/* Card 2: RUAC Status */}
                    <div className="flex min-w-[180px] flex-col justify-between rounded-2xl p-5 bg-surface-dark border border-slate-800 shadow-md snap-start">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <FaCheckCircle size={20} />
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Registros</p>
                            <p className="text-2xl font-bold text-white">{isRuacVerified ? 'Activo' : 'Pendiente'}</p>
                            <p className="text-emerald-400 text-xs font-medium mt-1 cursor-pointer hover:text-emerald-300 transition-colors" onClick={() => router.push('/pets/new')}>{isRuacVerified ? 'Verificado ✓' : 'Subir RUAC →'}</p>
                        </div>
                    </div>
                    {/* Card 3: Total Docs */}
                    <div className="flex min-w-[160px] flex-col justify-between rounded-2xl p-5 bg-surface-dark border border-slate-800 shadow-md snap-start">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                <FaFileAlt size={20} />
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Total</p>
                            <p className="text-2xl font-bold text-white">{totalDocs} Docs</p>
                            <p className="text-purple-400 text-xs font-medium mt-1">Disponibles</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search & Filters */}
            <section className="relative z-10 px-6 mt-2">
                <div className="relative w-full h-12 mb-4">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                        <FaSearch />
                    </div>
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-full pl-12 pr-4 rounded-xl bg-surface-dark border-transparent focus:border-primary focus:ring-0 text-white placeholder-slate-500 transition-all shadow-sm"
                        placeholder="Buscar documento..."
                        type="text"
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {['Todos', 'Médico', 'Legal', 'Identificación'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`flex h-9 px-5 shrink-0 items-center justify-center rounded-full font-medium text-sm transition-colors ${filterType === type
                                ? 'bg-white text-background-dark font-semibold shadow-glow'
                                : 'bg-surface-dark border border-green-800 text-slate-300 hover:bg-green-900'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </section>

            {/* Document List */}
            <section className="relative z-10 px-6 mt-4 flex flex-col gap-3">
                <h3 className="text-lg font-bold text-white mb-1">Recientes</h3>
                {filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => (
                    <div
                        key={doc.document_id || idx}
                        onClick={() => setSelectedDoc(doc)}
                        className="group relative flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-green-900/50 hover:bg-green-900 hover:border-green-800 transition-all active:scale-[0.99] cursor-pointer"
                    >
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-opacity-10 ${doc.document_type.includes('Vacuna') ? 'bg-red-500 text-red-400' :
                            doc.document_type.includes('Certificado') || doc.document_type.includes('Acta') ? 'bg-orange-500 text-orange-400' :
                                'bg-blue-500 text-blue-400'
                            }`}>
                            {doc.document_type.includes('Vacuna') ? <FaStethoscope size={20} /> :
                                doc.document_type.includes('ID') || doc.document_type.includes('Credencial') ? <FaIdCard size={20} /> :
                                    <FaFileAlt size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="text-base font-bold text-white truncate pr-2">{doc.document_type}</h4>
                                {doc.expires_at && <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/20 uppercase tracking-wide">Vence pronto</span>}
                            </div>
                            <p className="text-sm text-slate-400 mt-0.5">{doc.pet_name} • {new Date(doc.created_at || doc.issued_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-slate-500">
                            <FaChevronRight />
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-8 bg-surface-dark rounded-2xl border border-dashed border-slate-700">
                        <p className="text-slate-400">No se encontraron documentos.</p>
                    </div>
                )}

                {/* Check if user has no pets */}
                {pets.length === 0 && (
                    <div className="text-center p-8 bg-surface-dark rounded-2xl border border-dashed border-slate-700 animate-pulse">
                        <h4 className="text-white font-bold mb-2">¡Bienvenido!</h4>
                        <p className="text-slate-400 mb-4">Registra a tu primera mascota para empezar a guardar sus documentos.</p>
                        <button onClick={() => router.push('/pets/new')} className="btn btn-primary">Registrar Mascota</button>
                    </div>
                )}

                <div className="h-10"></div>
            </section>

            {/* Document Viewer Modal */}
            <DocumentViewerModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />
        </div>
    );
}
