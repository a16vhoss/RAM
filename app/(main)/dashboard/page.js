import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlus, FaQrcode, FaSearch, FaCalendarAlt, FaPaw } from 'react-icons/fa';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    // Fetch Pets
    const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [user.user_id]);

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>Hola, {user.first_name}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Bienvenido a tu panel de control</p>

            {/* Accessos Rapidos */}
            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Accesos Rápidos</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Link href="/pets/new" style={quickActionStyle}>
                        <div style={{ background: '#E3F2FD', padding: '12px', borderRadius: '50%', marginBottom: '8px' }}>
                            <FaPlus color="var(--primary)" size={20} />
                        </div>
                        <span>Registrar</span>
                    </Link>
                    <Link href="/directory" style={quickActionStyle}>
                        <div style={{ background: '#E8F5E9', padding: '12px', borderRadius: '50%', marginBottom: '8px' }}>
                            <FaSearch color="var(--success)" size={20} />
                        </div>
                        <span>Buscar</span>
                    </Link>
                    <Link href="/documents" style={quickActionStyle}>
                        <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '50%', marginBottom: '8px' }}>
                            <FaQrcode color="#FB8C00" size={20} />
                        </div>
                        <span>Documentos</span>
                    </Link>
                    <Link href="/appointments" style={quickActionStyle}>
                        <div style={{ background: '#F3E5F5', padding: '12px', borderRadius: '50%', marginBottom: '8px' }}>
                            <FaCalendarAlt color="#8E24AA" size={20} />
                        </div>
                        <span>Citas</span>
                    </Link>
                </div>
            </section>

            {/* Mascotas */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px' }}>Tus Mascotas</h2>
                    <Link href="/pets/new" style={{ fontSize: '14px', color: 'var(--primary)' }}>Agregar</Link>
                </div>

                {pets.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>No tienes mascotas registradas.</p>
                        <Link href="/pets/new" className="btn btn-primary" style={{ marginTop: '12px' }}>Registrar Mascota</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pets.map(pet => (
                            <div key={pet.pet_id} style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '50%', overflow: 'hidden', marginRight: '16px' }}>
                                    {pet.pet_photo && pet.pet_photo.startsWith('http') ? (
                                        <img src={pet.pet_photo} alt={pet.pet_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                            <FaPaw />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ marginBottom: '4px' }}>{pet.pet_name}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{pet.breed || pet.species} • {calculateAge(pet.birth_date)}</p>
                                </div>
                                <div style={{ marginLeft: 'auto' }}>
                                    <Link href={`/pets/${pet.pet_id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>Ver</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

const quickActionStyle = {
    background: 'white',
    padding: '16px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)'
};

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
