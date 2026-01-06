'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaSlidersH } from 'react-icons/fa';

export default function DashboardSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/directory?q=${encodeURIComponent(query)}`);
        } else {
            router.push('/directory');
        }
    };

    return (
        <form onSubmit={handleSearch} style={{
            position: 'relative', width: '100%', height: '56px', background: 'white',
            borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '0 16px',
            boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)'
        }}>
            <FaSearch color="#94a3b8" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar veterinaria, servicio..."
                style={{
                    width: '100%', background: 'transparent', border: 'none',
                    paddingLeft: '12px', fontSize: '14px', color: 'var(--text-main)', outline: 'none'
                }}
            />
            <button type="button" onClick={() => router.push('/directory')} style={{
                padding: '6px', background: 'rgba(39, 145, 231, 0.1)',
                borderRadius: '8px', marginLeft: '8px', border: 'none', cursor: 'pointer'
            }}>
                <FaSlidersH color="var(--primary)" />
            </button>
        </form>
    );
}
