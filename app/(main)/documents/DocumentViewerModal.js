'use client';

import { FaTimes, FaDownload, FaShareAlt, FaPaw, FaFingerprint } from 'react-icons/fa';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export default function DocumentViewerModal({ document, onClose }) {
    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        if (document) {
            // Generate QR for specific document verification
            QRCode.toDataURL(`https://ram-register.com/verify/${document.unique_registration_number || document.document_id}`, {
                margin: 1,
                width: 150,
                color: { dark: '#000000', light: '#ffffff' }
            }).then(setQrUrl);
        }
    }, [document]);

    if (!document) return null;

    const isCredential = document.document_type.includes('Credencial') || document.document_type.includes('ID');
    const isActa = document.document_type.includes('Acta') || document.document_type.includes('Certificado');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-lg transform transition-all animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                {/* Document Container */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">

                    {/* Render Template based on Type */}
                    {isCredential ? (
                        <CredentialTemplate doc={document} qrUrl={qrUrl} />
                    ) : isActa ? (
                        <ActaTemplate doc={document} qrUrl={qrUrl} />
                    ) : (
                        <GenericTemplate doc={document} qrUrl={qrUrl} />
                    )}

                    {/* Action Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex gap-3">
                        <button className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <FaDownload /> Descargar PDF
                        </button>
                        <button className="px-4 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
                            <FaShareAlt />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CredentialTemplate({ doc, qrUrl }) {
    // Use the OG image API for consistent credential design
    const credentialImageUrl = `/api/og?id=${doc.pet_id}`;

    return (
        <div className="relative w-full bg-slate-900">
            {/* Credential Image from OG API */}
            <img
                src={credentialImageUrl}
                alt={`Credencial de ${doc.pet_name}`}
                className="w-full h-auto"
                style={{ aspectRatio: '1000/500' }}
            />
        </div>
    );
}

function ActaTemplate({ doc, qrUrl }) {
    const formatDate = (date) => {
        if (!date) return 'XX/XX/XXXX';
        return new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="bg-[#fefefe] text-slate-800 relative" style={{ minHeight: '600px' }}>
            {/* Decorative Border */}
            <div className="absolute inset-3 border-2 border-slate-300 pointer-events-none"></div>
            <div className="absolute inset-4 border border-slate-200 pointer-events-none"></div>

            <div className="p-8 relative">
                {/* 1. HEADER */}
                <div className="text-center mb-6">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <img src="/images/logo.png" alt="RAM" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        <h1 className="text-xl font-bold tracking-wide text-slate-900 uppercase">Acta de Registro Animal</h1>
                    </div>
                    <div className="bg-slate-900 text-white py-1.5 px-4 rounded inline-block">
                        <span className="font-mono text-sm font-bold tracking-wider">{doc.unique_registration_number || 'RAM-000000000-00'}</span>
                    </div>
                </div>

                {/* 2. PHOTO + QR */}
                <div className="flex justify-center items-center gap-6 mb-6">
                    {/* Pet Photo */}
                    <div className="w-28 h-28 rounded-full border-4 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-lg">
                        {doc.pet_photo ? (
                            <img src={doc.pet_photo} alt={doc.pet_name} className="w-full h-full object-cover" />
                        ) : (
                            <FaPaw className="text-4xl text-slate-300" />
                        )}
                    </div>
                    {/* QR Code */}
                    {qrUrl && (
                        <div className="flex flex-col items-center">
                            <img src={qrUrl} className="w-20 h-20" alt="QR Verificación" />
                            <span className="text-[9px] text-slate-400 mt-1 uppercase">Verificar</span>
                        </div>
                    )}
                </div>

                {/* 3. PET IDENTIFICATION */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Datos de la Mascota</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                            <span className="text-xs text-slate-400">Nombre</span>
                            <p className="font-bold text-slate-900">{doc.pet_name}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Fecha de Nacimiento</span>
                            <p className="font-semibold">{formatDate(doc.birth_date)}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Sexo</span>
                            <p className="font-semibold">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs ${doc.sex === 'Macho' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                    {doc.sex === 'Macho' ? 'M (Macho)' : 'H (Hembra)'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Lugar de Nacimiento</span>
                            <p className="font-semibold">{doc.pet_city || 'No especificado'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Raza</span>
                            <p className="font-semibold">{doc.breed || 'Mestizo'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Color</span>
                            <p className="font-semibold">{doc.color || 'No especificado'}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-xs text-slate-400">Señas Particulares</span>
                            <p className="font-semibold text-slate-700">{doc.medical_notes || 'Ninguna'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Microchip</span>
                            <p className="font-mono text-xs">{doc.microchip_number || 'No registrado'}</p>
                        </div>
                    </div>
                </div>

                {/* 4. OWNER DATA */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Humano Responsable</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="col-span-2">
                            <span className="text-xs text-slate-400">Nombre Completo</span>
                            <p className="font-bold text-slate-900">{doc.owner_first_name} {doc.owner_last_name}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Email</span>
                            <p className="font-semibold text-sm truncate">{doc.owner_email || 'No registrado'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Celular</span>
                            <p className="font-semibold">{doc.owner_phone || 'No registrado'}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-xs text-slate-400">Ubicación</span>
                            <p className="font-semibold">{doc.owner_location || doc.owner_city || 'No especificado'}</p>
                        </div>
                    </div>
                </div>

                {/* 5. FOOTER - Signatures */}
                <div className="flex justify-between items-end pt-4 border-t border-slate-200 mt-4">
                    <div className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="RAM" className="w-8 h-8 object-contain opacity-50" onError={(e) => e.target.style.display = 'none'} />
                        <div>
                            <p className="text-[10px] text-slate-400">Registro Animal Municipal</p>
                            <p className="text-[9px] text-slate-300">{formatDate(doc.issued_at || doc.created_at)}</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-32 h-8 border-b border-slate-300 mb-1"></div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Firma del Propietario</p>
                    </div>
                    <div className="text-center">
                        <div className="w-32 h-8 border-b border-slate-300 mb-1"></div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Firma Autorizada</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GenericTemplate({ doc }) {
    return (
        <div className="bg-white p-8">
            <h2 className="text-xl font-bold mb-4">{doc.document_type}</h2>
            <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Mascota:</strong> {doc.pet_name}</p>
                <p><strong>Fecha:</strong> {new Date(doc.issued_at).toLocaleDateString()}</p>
                <p><strong>Folio:</strong> {doc.unique_registration_number || 'N/A'}</p>
            </div>
        </div>
    );
}
