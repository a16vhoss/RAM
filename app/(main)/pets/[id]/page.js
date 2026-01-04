'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { FaArrowLeft, FaPaw, FaCalendarAlt, FaWeight, FaVenusMars, FaQrcode, FaDownload, FaEdit } from 'react-icons/fa';
import Link from 'next/link';

export default function PetProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [pet, setPet] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPet() {
            try {
                const res = await fetch(`/api/pets/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPet(data);

                    // Generate QR Code with pet info URL
                    const petInfoUrl = `${window.location.origin}/public/pet/${params.id}`;
                    const qr = await QRCode.toDataURL(petInfoUrl, {
                        width: 300,
                        margin: 2,
                        color: {
                            dark: '#1C77C3',
                            light: '#FFFFFF'
                        }
                    });
                    setQrCodeUrl(qr);
                } else {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error fetching pet:', error);
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        }

        fetchPet();
    }, [params.id, router]);

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `${pet.pet_name}-QR.png`;
        link.click();
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!pet) return null;

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'No especificado';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return `${age} año${age !== 1 ? 's' : ''}`;
    };

    return (
        <div style={{ padding: '0 0 80px 0' }}>
            {/* Header */}
            <div style={{ position: 'relative', background: 'linear-gradient(135deg, #1C77C3, #30A4D9)', padding: '20px', color: 'white' }}>
                <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', marginBottom: '16px' }}>
                    <FaArrowLeft /> Regresar
                </Link>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '100px', height: '100px', background: 'white', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {pet.pet_photo && pet.pet_photo.startsWith('http') ? (
                            <img src={pet.pet_photo} alt={pet.pet_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <FaPaw size={40} color="#ccc" />
                        )}
                    </div>
                    <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{pet.pet_name}</h1>
                    <p style={{ opacity: 0.9 }}>{pet.breed} • {pet.species}</p>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                {/* QR Code Section */}
                <section style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                        <FaQrcode size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '18px' }}>Placa de Identificación</h2>
                    </div>

                    {qrCodeUrl && (
                        <>
                            <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '250px', margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Escanea este código para ver la información de {pet.pet_name}
                            </p>
                            <button onClick={downloadQR} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <FaDownload /> Descargar QR
                            </button>
                        </>
                    )}
                </section>

                {/* Basic Info */}
                <section style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Información Básica</h2>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <InfoRow icon={<FaCalendarAlt />} label="Edad" value={calculateAge(pet.birth_date)} />
                        <InfoRow icon={<FaVenusMars />} label="Sexo" value={pet.sex} />
                        <InfoRow icon={<FaWeight />} label="Peso" value={pet.weight ? `${pet.weight} kg` : 'No especificado'} />
                        <InfoRow icon={<FaPaw />} label="Color" value={pet.color} />
                        {pet.microchip_number && (
                            <InfoRow icon={<FaQrcode />} label="Microchip" value={pet.microchip_number} />
                        )}
                        <InfoRow icon={<FaCalendarAlt />} label="Esterilizado" value={pet.is_spayed ? 'Sí' : 'No'} />
                    </div>
                </section>

                {/* Medical Info */}
                {(pet.allergies || pet.medical_notes) && (
                    <section style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Información Médica</h2>

                        {pet.allergies && (
                            <div style={{ marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>Alergias</h3>
                                <p>{pet.allergies}</p>
                            </div>
                        )}

                        {pet.medical_notes && (
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>Notas Médicas</h3>
                                <p>{pet.medical_notes}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Registration Info */}
                <section style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Registro</h2>
                    <InfoRow icon={<FaQrcode />} label="ID de Registro" value={pet.unique_registration_number || 'Pendiente'} />
                    <InfoRow icon={<FaCalendarAlt />} label="Fecha de Registro" value={new Date(pet.registration_date).toLocaleDateString()} />
                </section>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FaEdit /> Editar
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }}>
                        Ver Documentos
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ color: 'var(--primary)', fontSize: '18px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontWeight: '500' }}>{value}</div>
            </div>
        </div>
    );
}
