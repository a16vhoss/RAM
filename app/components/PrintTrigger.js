'use client';

import { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PrintTrigger() {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const element = document.getElementById('poster-container');
            if (!element) {
                alert('No se encontró el contenido del cartel.');
                setLoading(false);
                return;
            }

            // Force specific dimensions for capture
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                width: 794,
                height: 1123,
                windowWidth: 794,
                windowHeight: 1123,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            // Create PDF with exact A4 dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add image to fill the entire A4 page
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            pdf.save('Cartel_Busqueda_RAM.pdf');

        } catch (err) {
            console.error('PDF Error:', err);
            alert('Error al generar PDF. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            data-html2canvas-ignore="true"
            className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform print:hidden z-50 hover:bg-black disabled:opacity-75 disabled:cursor-wait"
        >
            <FaDownload className="text-xl" />
            {loading ? 'Generando...' : 'Descargar Cartel'}
        </button>
    );
}
