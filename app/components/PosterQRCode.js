'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function PosterQRCode({ url }) {
    const [src, setSrc] = useState('');

    useEffect(() => {
        // Generate QR code on the client side to avoid server-side canvas dependencies
        QRCode.toDataURL(url, {
            width: 600,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
            .then(setSrc)
            .catch(err => console.error('Error generating QR code:', err));
    }, [url]);

    if (!src) {
        return (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono animate-pulse">
                RAM QR
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
