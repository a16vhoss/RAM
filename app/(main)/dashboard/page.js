import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { FaPlus, FaSearch, FaSlidersH, FaIdCard, FaStethoscope, FaSyringe, FaExclamationTriangle, FaBell } from 'react-icons/fa';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    // Fetch Pets
    const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [user.user_id]);

    return (
        <div style={{ paddingBottom: '100px', maxWidth: '100%', overflowX: 'hidden' }}>
            {/* Header Section */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 20,
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '24px 20px 12px 20px', transition: 'background 0.3s',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'User')}&background=random")`,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                border: '2px solid rgba(255,255,255,0.1)'
                            }}></div>
                            <div style={{
                                position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px',
                                background: '#22c55e', borderRadius: '50%', border: '2px solid var(--background)'
                            }}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bienvenido</span>
                            <h1 style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1, color: 'var(--text-main)' }}>{user.first_name || 'Usuario'}</h1>
                        </div>
                    </div>
                    <button style={{
                        position: 'relative', padding: '8px', borderRadius: '50%',
                        background: 'transparent', border: 'none', cursor: 'pointer'
                    }}>
                        <FaBell size={24} color="var(--text-secondary)" />
                        <span style={{
                            position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px',
                            background: '#ef4444', borderRadius: '50%', border: '2px solid var(--background)'
                        }}></span>
                    </button>
                </div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2', marginTop: '8px' }}>
                    Tus peludos están <br /><span style={{ color: 'var(--primary)' }}>protegidos y seguros.</span>
                </p>
            </header >

            <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                {/* Search Bar */}
                <div style={{ padding: '0 20px' }}>
                    <div style={{
                        position: 'relative', width: '100%', height: '56px', background: 'white',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '0 16px',
                        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)'
                    }}>
                        <FaSearch color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Buscar veterinaria, servicio..."
                            style={{
                                width: '100%', background: 'transparent', border: 'none',
                                paddingLeft: '12px', fontSize: '14px', color: 'var(--text-main)', outline: 'none'
                            }}
                        />
                        <button style={{
                            padding: '6px', background: 'rgba(39, 145, 231, 0.1)',
                            borderRadius: '8px', marginLeft: '8px', border: 'none', cursor: 'pointer'
                        }}>
                            <FaSlidersH color="var(--primary)" />
                        </button>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <section style={{ padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Acciones Rápidas</h2>
                        <button style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todo</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* RUAC */}
                        <div className="group" style={{
                            position: 'relative', overflow: 'hidden', borderRadius: '24px', height: '144px',
                            background: 'linear-gradient(135deg, #2563eb, #1e40af)', padding: '16px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            boxShadow: '0 10px 15px -3px rgba(30, 64, 175, 0.2)', cursor: 'pointer'
                        }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', opacity: 0.2 }}>
                                <FaIdCard size={80} color="white" />
                            </div>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FaIdCard color="white" />
                            </div>
                            <div>
                                <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', lineHeight: 1.2 }}>Registro RUAC</p>
                                <p style={{ color: '#dbeafe', fontSize: '11px', marginTop: '4px' }}>Identificación oficial</p>
                            </div>
                        </div>

                        {/* Vets */}
                        <div className="group" style={{
                            position: 'relative', overflow: 'hidden', borderRadius: '24px', height: '144px',
                            background: 'linear-gradient(135deg, #10b981, #0f766e)', padding: '16px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)', cursor: 'pointer'
                        }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', opacity: 0.2 }}>
                                <FaStethoscope size={80} color="white" />
                            </div>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FaStethoscope color="white" />
                            </div>
                            <div>
                                <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', lineHeight: 1.2 }}>Veterinarios</p>
                                <p style={{ color: '#d1fae5', fontSize: '11px', marginTop: '4px' }}>Directorio cercano</p>
                            </div>
                        </div>

                        {/* Cartilla */}
                        <Link href="/documents" className="group" style={{
                            position: 'relative', overflow: 'hidden', borderRadius: '24px', height: '144px',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', padding: '16px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.2)', cursor: 'pointer'
                        }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', opacity: 0.2 }}>
                                <FaSyringe size={80} color="white" />
                            </div>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FaSyringe color="white" />
                            </div>
                            <div>
                                <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', lineHeight: 1.2 }}>Cartilla Digital</p>
                                <p style={{ color: '#e9d5ff', fontSize: '11px', marginTop: '4px' }}>Vacunas y citas</p>
                            </div>
                        </Link>

                        {/* Amber Alert */}
                        <div className="group" style={{
                            position: 'relative', overflow: 'hidden', borderRadius: '24px', height: '144px',
                            background: 'linear-gradient(135deg, #f59e0b, #ea580c)', padding: '16px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)', cursor: 'pointer'
                        }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', opacity: 0.2 }}>
                                <FaExclamationTriangle size={80} color="white" />
                            </div>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FaExclamationTriangle color="white" />
                            </div>
                            <div>
                                <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', lineHeight: 1.2 }}>Alerta Amber</p>
                                <p style={{ color: '#fed7aa', fontSize: '11px', marginTop: '4px' }}>Reportar extravío</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tip Banner */}
                <section style={{ padding: '0 20px' }}>
                    <div style={{
                        position: 'relative', width: '100%', borderRadius: '24px', overflow: 'hidden',
                        height: '128px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px',
                        background: '#1c262e'
                    }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #9333ea, #db2777)', opacity: 0.9, zIndex: 0 }}></div>
                        <div style={{ position: 'relative', zIndex: 10, maxWidth: '60%' }}>
                            <span style={{
                                display: 'inline-block', padding: '4px 8px', borderRadius: '6px',
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                                fontSize: '10px', fontWeight: '700', color: 'white', marginBottom: '8px',
                                textTransform: 'uppercase'
                            }}>Tip del día</span>
                            <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', lineHeight: 1.4 }}>La hidratación es clave. Cambia el agua de Max 3 veces al día.</p>
                        </div>
                        <div style={{
                            position: 'relative', zIndex: 10, width: '80px', height: '80px',
                            borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)',
                            overflow: 'hidden', flexShrink: 0, background: 'white'
                        }}>
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8C8auowYV8uJJuZgzvEXrnh8b4hBUpQJb3yn_J4u6ZVhM_loZU7UemBwnuxwFW12hyCE1iKnIbHu1bRVgxENNo5Ia7MyepghWmOabsDyY5NigXOVzQI2G9_eFTsU9X0FaR9JWyDwfHcBiXy3YmWc4hh7Ox-u7mp0FRNOFXQ78nqggVGVX6nRqRdYQljAnsETQQfUJrjphHqHZxgQmibIsQ5mkIy_aElAF3FgPx-BGDTtELL5XMnzg8Gvv8zaKNpmt3YOaNPOH9CTU" alt="Tip" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </section>

                {/* Pets Carousel */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Tus Mascotas</h2>
                        <Link href="/pets/new" style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--surface-dark)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', cursor: 'pointer'
                        }}>
                            <FaPlus size={14} />
                        </Link>
                    </div>

                    {/* Scroll Container */}
                    <div className="no-scrollbar snap-x" style={{
                        display: 'flex', overflowX: 'auto', gap: '16px', padding: '0 20px 16px 20px'
                    }}>
                        {pets.length === 0 ? (
                            <div style={{
                                minWidth: '160px', height: '220px', borderRadius: '24px',
                                background: 'var(--surface)', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)'
                            }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sin mascotas</p>
                            </div>
                        ) : (
                            pets.map(pet => (
                                <Link
                                    href={`/pets/${pet.pet_id}`}
                                    key={pet.pet_id}
                                    className="snap-center group"
                                    style={{
                                        minWidth: '160px', height: '220px', borderRadius: '24px', overflow: 'hidden',
                                        position: 'relative', cursor: 'pointer', boxShadow: 'var(--shadow-md)', flexShrink: 0
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        backgroundImage: `url('${pet.pet_photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80"}')`,
                                        backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s'
                                    }}></div>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)' }}></div>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            background: 'rgba(34, 197, 94, 0.2)', backdropFilter: 'blur(4px)',
                                            padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(34, 197, 94, 0.3)'
                                        }}>
                                            <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }}></span>
                                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#dcfce7' }}>Al día</span>
                                        </div>
                                        <p style={{ color: 'white', fontWeight: '700', fontSize: '20px' }}>{pet.pet_name}</p>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{pet.breed || pet.species}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                        {/* Fake Card for Preview of Scroll */}
                        <div className="snap-center" style={{ minWidth: '20px' }}></div>
                    </div>
                </section>

                <div style={{ height: '20px' }}></div>
            </main>
        </div >
    );
}

function calculateAge(birthDateString) {
    if (!birthDateString) return '';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age + ' años';
}
