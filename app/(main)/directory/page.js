import db from '@/lib/db';
import Link from 'next/link';
import { FaMapMarkerAlt, FaStar, FaPhone, FaWhatsapp, FaFilter } from 'react-icons/fa';
import DirectoryMap from '@/components/directory/DirectoryMap';

export default async function DirectoryPage({ searchParams }) {
    const query = searchParams?.q || '';
    const type = searchParams?.type || 'Todos';

    let sql = "SELECT * FROM providers WHERE status = 'Activo'";
    const params = [];

    if (type !== 'Todos') {
        params.push(type);
        sql += ` AND provider_type = $${params.length}`;
    }

    if (query) {
        params.push(`%${query}%`, `%${query}%`);
        sql += ` AND (business_name ILIKE $${params.length - 1} OR description ILIKE $${params.length})`;
    }

    // Order by premium first
    sql += ' ORDER BY is_premium DESC, rating_average DESC';

    const providers = await db.getAll(sql, params);

    const filters = ['Todos', 'Veterinario', 'Clínica 24h', 'Estética', 'Refugio', 'Paseador'];

    return (
        <div style={{ padding: '0 0 80px 0' }}>
            {/* Header & Search */}
            <div style={{ background: 'white', padding: '16px', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '20px', marginBottom: '12px' }}>Directorio</h1>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                        type="text"
                        placeholder="Buscar servicios..."
                        className="input-control"
                        defaultValue={query}
                        // For a real app, bind to searchParams or use a client component for search input
                        key={query}
                    />
                    <button className="btn btn-secondary" style={{ padding: '0 12px' }}><FaFilter /></button>
                </div>

                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {filters.map(f => (
                        <Link
                            key={f}
                            href={`/directory?type=${f}`}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                background: type === f ? 'var(--primary)' : '#f0f0f0',
                                color: type === f ? 'white' : 'var(--text-main)',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                border: 'none',
                                textDecoration: 'none'
                            }}
                        >
                            {f}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Map/List Toggle */}
            <div style={{ padding: '16px' }}>
                <DirectoryMap providers={providers} />
            </div>

            {/* Results */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {providers.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>No se encontraron resultados.</p>
                ) : (
                    providers.map(p => (
                        <div key={p.provider_id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)',
                            border: p.is_premium ? '2px solid #FFD700' : '1px solid var(--border)'
                        }}>
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '16px', margin: 0 }}>{p.business_name}</h3>
                                    {p.is_premium && <span style={{ background: '#FFD700', color: 'black', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>PREMIUM</span>}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', fontSize: '14px', color: '#f39c12' }}>
                                    <FaStar /> <span>{p.rating_average}</span> <span style={{ color: '#aaa' }}>({p.total_reviews})</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                                    <FaMapMarkerAlt /> <span>{p.address}</span>
                                </div>

                                {p.services && (
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                        {JSON.parse(p.services).slice(0, 3).map(s => (
                                            <span key={s} style={{ background: '#F0F7FC', color: 'var(--primary)', fontSize: '10px', padding: '4px 8px', borderRadius: '4px' }}>{s}</span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <a href={`tel:${p.phone}`} className="btn" style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', fontSize: '14px' }}>
                                        <FaPhone style={{ marginRight: '6px' }} /> Llamar
                                    </a>
                                    <Link href={`/directory/${p.provider_id}`} className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '14px' }}>
                                        Ver Perfil
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
