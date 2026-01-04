import db from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowLeft, FaMapMarkerAlt, FaStar, FaPhone, FaWhatsapp, FaClock, FaCheckCircle } from 'react-icons/fa';

export default async function ProviderPage({ params }) {
    const { id } = await params;

    const provider = await db.getOne('SELECT * FROM providers WHERE provider_id = $1', [id]);

    if (!provider) {
        notFound();
    }

    const specialities = JSON.parse(provider.specialties || '[]');
    const services = JSON.parse(provider.services || '[]');
    const schedule = JSON.parse(provider.schedule || '{}');

    return (
        <div style={{ padding: '0 0 80px 0' }}>
            {/* Header Image */}
            <div style={{ position: 'relative', height: '200px', background: '#333' }}>
                {/* <Image ... /> Placeholder */}
                <div style={{ width: '100%', height: '100%', opacity: 0.5, backgroundImage: 'url(https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1327&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

                <Link href="/directory" style={{ position: 'absolute', top: '20px', left: '20px', background: 'white', padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                    <FaArrowLeft /> Volver
                </Link>

                <div style={{ position: 'absolute', bottom: '-40px', left: '20px', width: '80px', height: '80px', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ width: '100%', height: '100%', background: '#eee', borderRadius: '50%', overflow: 'hidden' }}>
                        <img src={`/api/placeholder?name=${provider.business_name}`} alt="Logo" style={{ width: '100%', height: '100%' }} />
                    </div>
                </div>
            </div>

            <div style={{ padding: '50px 20px 20px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>{provider.business_name}</h1>
                        <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}>{provider.provider_type}</p>
                    </div>
                    {provider.is_verified && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--success)', fontSize: '10px' }}>
                            <FaCheckCircle size={20} />
                            <span>Verificado</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '12px 0', fontSize: '16px', color: '#f39c12' }}>
                    <FaStar />
                    <span style={{ fontWeight: 'bold' }}>{provider.rating_average}</span>
                    <span style={{ color: '#aaa', fontSize: '14px' }}>({provider.total_reviews} reseñas)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#555', fontSize: '14px', marginBottom: '24px' }}>
                    <FaMapMarkerAlt style={{ marginTop: '3px', flexShrink: 0 }} />
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.address}, ${provider.city}, ${provider.state}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'underline', color: 'var(--primary)' }}
                    >
                        {provider.address}, {provider.city}, {provider.state}
                    </a>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <a href={`tel:${provider.phone}`} className="btn btn-primary" style={{ flex: 1 }}>
                        <FaPhone style={{ marginRight: '8px' }} /> Llamar
                    </a>
                    <button className="btn btn-success" style={{ flex: 1 }}>
                        <FaWhatsapp style={{ marginRight: '8px' }} /> WhatsApp
                    </button>
                </div>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Especialidades</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {specialities.map(s => (
                            <span key={s} style={{ background: '#F0F7FC', color: 'var(--primary)', padding: '6px 12px', borderRadius: '16px', fontSize: '13px' }}>{s}</span>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Ubicación</h3>
                    <div style={{ height: '200px', background: '#eee', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${provider.address}, ${provider.city}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                    </div>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Sobre nosotros</h3>
                    <p style={{ color: '#555', lineHeight: '1.6', fontSize: '14px' }}>{provider.description}</p>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Horarios</h3>
                    <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px' }}>
                        {Object.entries(schedule).map(([day, hours]) => (
                            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                                <span style={{ textTransform: 'capitalize' }}>{day}</span>
                                <span style={{ fontWeight: '600' }}>{hours}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
