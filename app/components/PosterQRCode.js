'use client';

import { useEffect, useState } from 'react';

export default function PosterQRCode({ url }) {
    const [src, setSrc] = useState('');

    useEffect(() => {
        let isMounted = true;

        // Dynamic import to strictly avoid any Server-Side (Node) execution
        // of the qrcode library which might look for 'canvas'
        import('qrcode').then(QRCode => {
            if (!isMounted) return;

            QRCode.toDataURL(url, {
                width: 600,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
                .then(dataUrl => {
                    if (isMounted) setSrc(dataUrl);
                })
                .catch(err => console.error('Error generating QR code:', err));
        });

        return () => { isMounted = false; };
    }, [url]);

    if (!src) {
        return (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono animate-pulse">
                Generando QR...
            </div>
        );
    }

    return (
        <img
            src={src}
            alt="Código QR del perfil"
            className="w-full h-full object-contain"
        />
    );
}
