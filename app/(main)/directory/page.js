import db from '@/lib/db';
import Link from 'next/link';
import { FaMapMarkerAlt, FaStar, FaFilter, FaChevronRight, FaSearch, FaBell, FaSlidersH, FaThLarge, FaStethoscope, FaCut, FaAmbulance, FaStore, FaHeart, FaRegHeart } from 'react-icons/fa';

export default async function DirectoryPage({ searchParams }) {
    const query = searchParams?.q || '';
    const type = searchParams?.type || 'Todos';

    let sql = "SELECT * FROM providers WHERE status = 'Activo'";
    const params = [];

    if (type !== 'Todos') {
        const typeMap = {
            'Veterinarians': 'Veterinario',
            'Grooming': 'Estética',
            'Emergency': 'Clínica 24h',
            'Pet Shops': 'Tienda',
            'All': 'Todos'
        };
        // Simple mapping or direct pass if matches DB
        const dbType = typeMap[type] || type;
        if (dbType !== 'Todos') {
            params.push(dbType);
            sql += ` AND provider_type = $${params.length}`;
        }
    }

    if (query) {
        params.push(`%${query}%`, `%${query}%`);
        sql += ` AND (business_name ILIKE $${params.length - 1} OR description ILIKE $${params.length})`;
    }

    // Order by premium first
    sql += ' ORDER BY is_premium DESC, rating_average DESC';

    const providers = await db.getAll(sql, params);

    const filters = [
        { name: 'All', icon: <FaThLarge /> },
        { name: 'Veterinarians', icon: <FaStethoscope /> },
        { name: 'Grooming', icon: <FaCut /> },
        { name: 'Emergency', icon: <FaAmbulance /> },
        { name: 'Pet Shops', icon: <FaStore /> }
    ];

    return (
        <div style={{ minHeight: '100vh', padding: '0 0 100px 0', background: 'var(--background-dark)', color: 'white' }}>
            {/* Top Navigation & Location */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40, width: '100%',
                background: 'rgba(17, 26, 33, 0.95)', backdropFilter: 'blur(12px)', paddingTop: '16px'
            }}>
                <div style={{ padding: '0 20px 12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-dark)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                        }}>
                            <FaMapMarkerAlt size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Ubicación</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>Ciudad de México</span>
                            </div>
                        </div>
                    </div>
                    <button style={{
                        position: 'relative', width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--surface-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', border: 'none', cursor: 'pointer'
                    }}>
                        <FaBell size={20} />
                        <span style={{
                            position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px',
                            background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--surface-dark)'
                        }}></span>
                    </button>
                </div>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 20px' }}>
                {/* Headline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h1 style={{
                        fontSize: '30px', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Encuentra lo mejor <br /><span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>cerca de ti</span>
                    </h1>
                </div>

                {/* Search Bar with Glow */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        position: 'absolute', inset: '-2px', background: 'linear-gradient(to right, var(--primary), #60a5fa)',
                        borderRadius: '16px', filter: 'blur(8px)', opacity: 0.2
                    }}></div>
                    <div style={{
                        position: 'relative', width: '100%', height: '56px', background: 'var(--surface-dark)',
                        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ paddingLeft: '16px', paddingRight: '12px', color: '#94a3b8' }}>
                            <FaSearch size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Clínicas, estética, especialistas..."
                            defaultValue={query}
                            style={{
                                width: '100%', height: '100%', background: 'transparent', border: 'none',
                                outline: 'none', color: 'white', fontSize: '16px', paddingRight: '16px'
                            }}
                        />
                        <div style={{ paddingRight: '8px' }}>
                            <button style={{
                                width: '40px', height: '40px', borderRadius: '12px', background: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                                border: 'none', cursor: 'pointer'
                            }}>
                                <FaSlidersH size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="no-scrollbar" style={{ width: '100%', overflowX: 'auto', margin: '0 -20px', padding: '0 20px 8px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
                        {filters.map(f => (
                            <Link
                                key={f.name}
                                href={`/directory?type=${f.name}`}
                                style={{
                                    height: '40px', padding: '0 20px', borderRadius: '999px',
                                    background: type === f.name ? 'var(--primary)' : 'var(--surface-dark)',
                                    color: type === f.name ? 'white' : '#cbd5e1',
                                    fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px',
                                    border: type === f.name ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: type === f.name ? '0 0 20px rgba(39, 145, 231, 0.3)' : 'none',
                                    textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{f.icon}</span>
                                {f.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Results List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                        <h3 style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>Recomendados</h3>
                        <button style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todo</button>
                    </div>

                    {providers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <FaSearch size={32} color="#64748b" style={{ margin: '0 auto 16px', display: 'block' }} />
                            <p style={{ color: '#94a3b8' }}>No se encontraron resultados.</p>
                        </div>
                    ) : (
                        providers.map(p => (
                            <div key={p.provider_id} style={{ width: '100%' }}>
                                <div style={{
                                    position: 'relative', display: 'flex', flexDirection: 'column', width: '100%',
                                    background: 'var(--surface-dark)', borderRadius: '24px', overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                }}>
                                    {/* Image Area */}
                                    <div style={{ position: 'relative', height: '192px', width: '100%', overflow: 'hidden' }}>
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCij_BIYrl-l0jSpnWiTQTgbi4gpEPBgfG0VEYmUH18lqC8CO1lAzOjZyV8FJ-5PXZIqL8a8nw9OIszODyvPNsHxMSgPGNX6mYLxQCyaAHrkDzKpSVeZ7luaRsYmxIa3Jd9cxm24v-tMa7JGyEwJ1DcIBQBpaj6YQSwZ2OpBmmK2a2Wvr4u5ymUbkjMdFOLqj-ZdfYaPl3vm-UMp-ReC6jloy96gmygy-_5DAvFUrZur8LN27W4qniYkfeBDKKtzh6hfAVWARWF2V0E")', // Placeholder
                                            backgroundSize: 'cover', backgroundPosition: 'center'
                                        }}></div>
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                                            <button style={{
                                                width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none'
                                            }}>
                                                <FaRegHeart size={20} />
                                            </button>
                                        </div>
                                        {p.is_premium && (
                                            <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '999px', background: 'rgba(39, 145, 231, 0.9)', backdropFilter: 'blur(4px)',
                                                    color: 'white', fontSize: '10px', fontWeight: '700', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                }}>VERIFICADO</span>
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface-dark), transparent, transparent)', opacity: 0.9 }}></div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ position: 'relative', padding: '0 20px 20px 20px', marginTop: '-40px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{p.business_name}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#94a3b8' }}>
                                                    <FaMapMarkerAlt size={14} />
                                                    <span>{p.city}, {p.state} • 1.2km</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.1)',
                                                    padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)'
                                                }}>
                                                    <FaStar size={14} color="#eab308" />
                                                    <span style={{ color: '#eab308', fontWeight: '700', fontSize: '14px' }}>{p.rating_average || '4.9'}</span>
                                                </div>
                                                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>({p.total_reviews || 120} Reseñas)</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', marginBottom: '16px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>{p.provider_type}</span>
                                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>Servicios</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></span>
                                                <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: '500' }}>Abierto ahora</span>
                                            </div>
                                            <Link href={`/directory/${p.provider_id}`} style={{
                                                background: 'var(--primary)', color: 'white', fontSize: '14px', fontWeight: '600',
                                                padding: '10px 24px', borderRadius: '12px', textDecoration: 'none', boxShadow: 'var(--shadow-glow)'
                                            }}>
                                                Ver Detalles
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
