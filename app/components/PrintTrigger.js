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

            // Capture at natural size with high resolution
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            // Create A4 PDF
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Calculate scaling to fit A4 while maintaining aspect ratio
            const pdfWidth = 210;
            const pdfHeight = 297;
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const scaledWidth = imgWidth * ratio;
            const scaledHeight = imgHeight * ratio;

            // Center the image on the page
            const xOffset = (pdfWidth - scaledWidth) / 2;
            const yOffset = (pdfHeight - scaledHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
            pdf.save('Cartel_Busqueda_RAM.pdf');

        } catch (err) {
            console.error('PDF Error:', err);
            alert('Error al generar PDF.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            data-html2canvas-ignore="true"
            className="fixed bottom-8 right-8 bg-green-950 text-white px-6 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform print:hidden z-50 hover:bg-black disabled:opacity-75"
        >
            <FaDownload className="text-xl" />
            {loading ? 'Generando...' : 'Descargar Cartel'}
        </button>
    );
}
