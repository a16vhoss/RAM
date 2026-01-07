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
    return (
        <div className="bg-[#fffdf5] text-slate-800 p-8 relative border-b border-gray-100">
            {/* Border */}
            <div className="absolute inset-2 border-2 border-double border-[#e5e7eb] pointer-events-none"></div>

            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3 text-slate-400">
                    <FaFingerprint size={24} />
                </div>
                <h1 className="font-serif text-2xl font-bold text-slate-900 mb-1">Acta de Registro</h1>
                <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">República Mexicana</p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto text-center font-serif">
                <p className="text-sm leading-relaxed">
                    Se hace constar que <strong className="text-lg text-slate-900 block my-1">{doc.pet_name}</strong>
                    ha quedado debidamente inscrito(a) en el Registro Animal Municipal.
                </p>

                <div className="grid grid-cols-2 gap-4 text-left bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">
                    <div>
                        <span className="block text-xs text-slate-400 mb-0.5">Folio Único</span>
                        <span className="font-mono font-bold text-slate-700">{doc.unique_registration_number}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-400 mb-0.5">Fecha Registro</span>
                        <span className="font-bold text-slate-700">{new Date(doc.issued_at || doc.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-end">
                <div className="text-left">
                    {qrUrl && <img src={qrUrl} className="w-16 h-16 opacity-80" alt="QR" />}
                </div>
                <div className="text-right">
                    <div className="w-32 h-10 border-b border-slate-300 mb-1"></div>
                    <p className="text-[10px] text-slate-400 uppercase">Firma Autorizada</p>
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
