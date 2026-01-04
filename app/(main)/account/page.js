import { getSession } from '@/lib/auth';
import LogoutButton from '@/components/auth/LogoutButton';
import Link from 'next/link';
import { FaUserCircle, FaCrown } from 'react-icons/fa';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = session.user;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '24px' }}>Mi Cuenta</h1>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ marginRight: '16px' }}>
                    <FaUserCircle size={60} color="#ccc" />
                </div>
                <div>
                    <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{user.first_name} {user.last_name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{user.email}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: '#F0F7FC', padding: '4px 8px', borderRadius: '4px', marginTop: '8px', fontSize: '12px', color: 'var(--primary)' }}>
                        Plan Gratuito
                    </div>
                </div>
            </div>

            <section style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#666' }}>Suscripción</h3>
                <div style={{ background: 'linear-gradient(135deg, #1C77C3, #30A4D9)', borderRadius: '16px', padding: '20px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCrown />
                            <span style={{ fontWeight: 'bold' }}>Pasar a Premium</span>
                        </div>
                        <span style={{ fontWeight: 'bold' }}>$149/mes</span>
                    </div>
                    <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '16px' }}>Actas ilimitadas, citas médicas y más beneficios.</p>
                    <Link href="/pricing" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'white', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                        Ver Planes
                    </Link>
                </div>
            </section>

            <section style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#666' }}>Configuración</h3>
                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <Link href="/account/edit" style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'block', textDecoration: 'none', color: 'inherit' }}>Editar Perfil</Link>
                    <Link href="/account/password" style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'block', textDecoration: 'none', color: 'inherit' }}>Cambiar Contraseña</Link>
                    <Link href="/account/notifications" style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'block', textDecoration: 'none', color: 'inherit' }}>Notificaciones</Link>
                    <Link href="/account/privacy" style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'block', textDecoration: 'none', color: 'inherit' }}>Privacidad</Link>
                </div>
            </section>

            <LogoutButton />

            <div style={{ textAlign: 'center', marginTop: '30px', color: '#ccc', fontSize: '12px' }}>
                Versión 1.0.0
            </div>
        </div>
    );
}
