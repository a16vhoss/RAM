import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';

export default async function AppointmentsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [session.user.user_id]);

    // Mock appointments data
    const upcomingAppointments = [];
    const pastAppointments = [];

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1>Mis Citas</h1>
                <Link href="/directory" className="btn btn-primary" style={{ fontSize: '14px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaPlus /> Nueva Cita
                </Link>
            </div>

            {pets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Registra una mascota para agendar citas</p>
                    <Link href="/pets/new" className="btn btn-primary">Registrar Mascota</Link>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1C77C3, #30A4D9)', padding: '20px', borderRadius: '16px', color: 'white' }}>
                            <FaCalendarAlt size={28} style={{ marginBottom: '12px' }} />
                            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Próximas</p>
                            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{upcomingAppointments.length}</p>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)', padding: '20px', borderRadius: '16px', color: 'white' }}>
                            <FaClock size={28} style={{ marginBottom: '12px' }} />
                            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Completadas</p>
                            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{pastAppointments.length}</p>
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <section style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Próximas Citas</h2>
                        {upcomingAppointments.length === 0 ? (
                            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border)' }}>
                                <FaCalendarAlt size={40} color="#ccc" style={{ marginBottom: '12px' }} />
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No tienes citas programadas</p>
                                <Link href="/directory" className="btn btn-primary">Buscar Veterinario</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* Appointments would be mapped here */}
                            </div>
                        )}
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Acciones Rápidas</h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <Link href="/directory" style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ width: '48px', height: '48px', background: '#E3F2FD', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaMapMarkerAlt size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '2px' }}>Buscar Veterinario</h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Encuentra servicios cerca de ti</p>
                                </div>
                            </Link>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
