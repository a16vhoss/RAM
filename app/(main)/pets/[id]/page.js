'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { FaArrowLeft, FaShareAlt, FaCheckCircle, FaShieldAlt, FaMicrochip, FaPaw, FaWeight, FaVenusMars, FaBirthdayCake, FaIdCard, FaSyringe, FaCut, FaArrowRight } from 'react-icons/fa';
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
                            dark: '#000000',
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
            <div style={{ minHeight: '100vh', background: 'var(--background-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    if (!pet) return null;

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'No esp.';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return `${age} Año${age !== 1 ? 's' : ''}`;
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background-dark)', color: 'white', paddingBottom: '100px', overflowX: 'hidden' }}>
            {/* Background Ambient Glows */}
            <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '300px', height: '300px', background: 'rgba(39, 145, 231, 0.2)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ position: 'fixed', bottom: '10%', right: '-10%', width: '250px', height: '250px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }}></div>

            {/* Top Navigation */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', background: 'rgba(17, 26, 33, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <button onClick={() => router.back()} style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: 'pointer'
                }}>
                    <FaArrowLeft size={20} />
                </button>
                <h2 style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Perfil de Mascota</h2>
                <button style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none',
                    boxShadow: '0 0 15px rgba(39,145,231,0.5)', cursor: 'pointer'
                }}>
                    <FaShareAlt size={18} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>

                {/* Hero Section */}
                <div style={{ padding: '24px 16px 8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', maxHeight: '420px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--background-dark), transparent, transparent)', opacity: 0.6, zIndex: 10 }}></div>
                        <div style={{
                            width: '100%', height: '100%', backgroundImage: `url(${pet.pet_photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000'})`,
                            backgroundSize: 'cover', backgroundPosition: 'center', transform: 'scale(1.0)', transition: 'transform 0.7s'
                        }}></div>

                        {/* Floating Info Overlay */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '24px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '999px', background: 'rgba(39, 145, 231, 0.9)',
                                    backdropFilter: 'blur(4px)', fontSize: '10px', fontWeight: '700', color: 'white',
                                    textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>Verificado</span>
                            </div>
                            <h1 style={{ fontSize: '36px', fontWeight: '700', lineHeight: '1.1', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{pet.pet_name}</h1>
                            <p style={{ fontSize: '18px', fontWeight: '500', color: '#e2e8f0', textShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {pet.breed} <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white' }}></span> {calculateAge(pet.birth_date)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Chips */}
                <div className="no-scrollbar" style={{ display: 'flex', width: '100%', overflowX: 'auto', gap: '12px', padding: '16px', margin: '0 -16px' }}>
                    <div style={{ paddingLeft: '16px' }}></div>
                    <div style={{
                        display: 'flex', height: '36px', flexShrink: 0, alignItems: 'center', gap: '8px',
                        borderRadius: '999px', background: 'rgba(26, 34, 43, 0.6)', border: '1px solid rgba(255,255,255,0.08)',
                        paddingLeft: '12px', paddingRight: '16px', borderLeft: '4px solid #22c55e'
                    }}>
                        <FaCheckCircle color="#4ade80" size={16} />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Vacunado</span>
                    </div>
                    <div style={{
                        display: 'flex', height: '36px', flexShrink: 0, alignItems: 'center', gap: '8px',
                        borderRadius: '999px', background: 'rgba(26, 34, 43, 0.6)', border: '1px solid rgba(255,255,255,0.08)',
                        paddingLeft: '12px', paddingRight: '16px', borderLeft: '4px solid var(--primary)'
                    }}>
                        <FaShieldAlt color="var(--primary)" size={16} />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Registrado</span>
                    </div>
                    {pet.microchip_number && (
                        <div style={{
                            display: 'flex', height: '36px', flexShrink: 0, alignItems: 'center', gap: '8px',
                            borderRadius: '999px', background: 'rgba(26, 34, 43, 0.6)', border: '1px solid rgba(255,255,255,0.08)',
                            paddingLeft: '12px', paddingRight: '16px', borderLeft: '4px solid #a855f7'
                        }}>
                            <FaMicrochip color="#c084fc" size={16} />
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Chip Activo</span>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div style={{ padding: '8px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <StatCard icon={<FaPaw size={20} />} color="blue" label="Especie" value={pet.species} />
                        <StatCard icon={<FaWeight size={20} />} color="orange" label="Peso" value={pet.weight ? `${pet.weight}kg` : 'N/A'} />
                        <StatCard icon={<FaVenusMars size={20} />} color="pink" label="Sexo" value={pet.sex} />
                        <StatCard icon={<FaBirthdayCake size={20} />} color="yellow" label="Cumpleaños" value={formatDateShort(pet.birth_date)} />
                    </div>
                </div>

                {/* Digital ID Card Section */}
                <div style={{ padding: '16px', marginTop: '8px' }}>
                    <div style={{
                        position: 'relative', width: '100%', borderRadius: '24px', overflow: 'hidden',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2791e7 0%, #144a75 100%)' }}></div>
                        {/* Decorative Patterns */}
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(24px)', transform: 'translate(40px, -40px)' }}></div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '128px', height: '128px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(24px)', transform: 'translate(-40px, 40px)' }}></div>

                        <div style={{ position: 'relative', padding: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)' }}>
                                        <FaIdCard size={20} />
                                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ID Digital Oficial</span>
                                    </div>
                                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>MX-{pet.pet_id ? pet.pet_id.substring(0, 5).toUpperCase() : '00000'}</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Propietario</span>
                                    <span style={{ fontSize: '14px', color: 'white', fontWeight: '500' }}>Admin Usuario</span>
                                </div>
                            </div>

                            {/* QR Code Area */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={{ width: '80px', height: '80px' }} />}
                                </div>
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Escanear</span>
                            </div>
                        </div>

                        {/* Card Footer Action */}
                        <div onClick={() => router.push('/documents')} style={{
                            position: 'relative', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', padding: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}>
                            <span style={{ color: 'white', fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                VER DOCUMENTOS COMPLETOS <FaArrowRight size={14} />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Medical History */}
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
                        <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700' }}>Historial Reciente</h3>
                        <button style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none' }}>Ver todo</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Mock History Data based on design */}
                        <div style={{
                            background: 'rgba(26, 34, 43, 0.6)', backdropFilter: 'blur(12px)', padding: '16px',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', flexShrink: 0
                            }}>
                                <FaSyringe size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>Vacuna Antirrábica</p>
                                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Clínica VetMX • Dr. Suarez</p>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>10 Oct</p>
                        </div>

                        <div style={{
                            background: 'rgba(26, 34, 43, 0.6)', backdropFilter: 'blur(12px)', padding: '16px',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0
                            }}>
                                <FaCut size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>Estética Canina</p>
                                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Spa PetLife</p>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>25 Sep</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ icon, color, label, value }) {
    const colorMap = {
        blue: { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' },
        orange: { bg: 'rgba(249, 115, 22, 0.2)', text: '#fb923c' },
        pink: { bg: 'rgba(236, 72, 153, 0.2)', text: '#f472b6' },
        yellow: { bg: 'rgba(234, 179, 8, 0.2)', text: '#facc15' }
    };

    const theme = colorMap[color] || colorMap.blue;

    return (
        <div style={{
            background: 'rgba(26, 34, 43, 0.6)', backdropFilter: 'blur(12px)', padding: '16px',
            borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
            border: '1px solid rgba(255,255,255,0.08)', transition: 'background 0.2s'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ padding: '8px', borderRadius: '12px', background: theme.bg, color: theme.text }}>
                    {icon}
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{label}</span>
            </div>
            <p style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{value}</p>
        </div>
    );
}
