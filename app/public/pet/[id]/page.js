import db from '@/lib/db';
import { notFound } from 'next/navigation';
import { FaPaw, FaPhone, FaEnvelope } from 'react-icons/fa';

export default async function PublicPetPage({ params }) {
    const { id } = await params;

    const pet = await db.getOne('SELECT pets.*, users.first_name, users.last_name, users.email, users.phone FROM pets JOIN users ON pets.user_id = users.user_id WHERE pets.pet_id = $1', [id]);

    if (!pet) {
        notFound();
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1C77C3, #30A4D9)', padding: '20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', color: 'white', marginBottom: '24px' }}>
                    <div style={{ width: '120px', height: '120px', background: 'white', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                        {pet.pet_photo && pet.pet_photo.startsWith('http') ? (
                            <img src={pet.pet_photo} alt={pet.pet_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <FaPaw size={50} color="#ccc" />
                        )}
                    </div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{pet.pet_name}</h1>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>{pet.breed} • {pet.species}</p>
                </div>

                {/* Pet Info Card */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--primary)' }}>Información de la Mascota</h2>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        <InfoItem label="Sexo" value={pet.sex} />
                        <InfoItem label="Color" value={pet.color} />
                        {pet.microchip_number && <InfoItem label="Microchip" value={pet.microchip_number} />}
                        <InfoItem label="Registro" value={pet.unique_registration_number || 'RAM-' + pet.pet_id.substring(0, 8)} />
                    </div>
                </div>

                {/* Owner Contact Card */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--primary)' }}>Contacto del Dueño</h2>

                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {pet.first_name} {pet.last_name}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pet.phone && (
                            <a href={`tel:${pet.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#E3F2FD', borderRadius: '12px', textDecoration: 'none', color: 'var(--primary)' }}>
                                <FaPhone />
                                <span>{pet.phone}</span>
                            </a>
                        )}

                        <a href={`mailto:${pet.email}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#E8F5E9', borderRadius: '12px', textDecoration: 'none', color: 'var(--success)' }}>
                            <FaEnvelope />
                            <span>{pet.email}</span>
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '24px', color: 'white', opacity: 0.9 }}>
                    <p style={{ fontSize: '14px' }}>
                        Esta mascota está registrada en<br />
                        <strong>Registro Animal Mundial</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{label}</span>
            <span style={{ fontWeight: '500' }}>{value}</span>
        </div>
    );
}
