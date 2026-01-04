import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaFileAlt, FaDownload, FaQrcode, FaIdCard } from 'react-icons/fa';

export default async function DocumentsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const pets = await db.getAll('SELECT * FROM pets WHERE user_id = $1', [session.user.user_id]);
    const documents = await db.getAll('SELECT d.*, p.pet_name FROM documents d JOIN pets p ON d.pet_id = p.pet_id WHERE p.user_id = $1', [session.user.user_id]);

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '24px' }}>Mis Documentos</h1>

            {pets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No tienes mascotas registradas</p>
                    <Link href="/pets/new" className="btn btn-primary">Registrar Mascota</Link>
                </div>
            ) : (
                <>
                    {/* Document Types */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1C77C3, #30A4D9)', padding: '20px', borderRadius: '16px', color: 'white' }}>
                            <FaFileAlt size={32} style={{ marginBottom: '12px' }} />
                            <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Actas</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{documents.filter(d => d.document_type === 'Acta de Propiedad').length}</p>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)', padding: '20px', borderRadius: '16px', color: 'white' }}>
                            <FaIdCard size={32} style={{ marginBottom: '12px' }} />
                            <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Credenciales</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{documents.filter(d => d.document_type === 'Credencial').length}</p>
                        </div>
                    </div>

                    {/* Documents List */}
                    <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Todos los Documentos</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {documents.map(doc => (
                            <div key={doc.document_id} style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#E3F2FD', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {doc.document_type === 'Acta de Propiedad' ? <FaFileAlt color="var(--primary)" /> : <FaIdCard color="var(--success)" />}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '2px' }}>{doc.document_type}</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{doc.pet_name}</p>
                                    </div>
                                </div>
                                <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaDownload /> Descargar
                                </button>
                            </div>
                        ))}
                    </div>

                    {documents.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>No hay documentos generados aún</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
