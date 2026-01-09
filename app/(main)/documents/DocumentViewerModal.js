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

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!document) return;
        setIsDownloading(true);
        try {
            const isCredential = document.document_type.includes('Credencial') || document.document_type.includes('ID');
            // Determine the correct API endpoint
            const apiUrl = isCredential
                ? `/api/og?id=${document.pet_id}`
                : `/api/acta?id=${document.pet_id}`;

            // Fetch the image as a blob
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Trigger download
            const link = window.document.createElement('a');
            link.href = url;
            link.download = `${document.document_type.replace(/\s+/g, '_')}_${document.pet_name}.png`;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Hubo un error al descargar el documento. Por favor intenta de nuevo.');
        } finally {
            setIsDownloading(false);
        }
    };

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
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isDownloading ? (
                                <span className="animate-pulse">Descargando...</span>
                            ) : (
                                <>
                                    <FaDownload /> Descargar
                                </>
                            )}
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

function ActaTemplate({ doc }) {
    // Use the new server-side API to generate the Acta image
    // This ensures data consistency with the server and avoids client-side hydration issues
    const actaImageUrl = `/api/acta?id=${doc.pet_id}`;

    return (
        <div className="relative w-full bg-slate-100 min-h-[600px] flex items-center justify-center overflow-hidden">
            <img
                src={actaImageUrl}
                alt={`Acta de Registro de ${doc.pet_name}`}
                className="w-full h-auto object-contain"
                style={{ aspectRatio: '2/3', maxHeight: '80vh' }}
            />
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
