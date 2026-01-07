import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const petId = searchParams.get('id');

        if (!petId) {
            return new Response('Missing Pet ID', { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables');
            return new Response('Server Configuration Error', { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: pet, error } = await supabase
            .from('pets')
            .select('pet_name, species, breed, sex, birth_date, color, weight, pet_photo, microchip_number')
            .eq('pet_id', petId)
            .single();

        if (error || !pet) {
            return new Response('Pet not found', { status: 404 });
        }

        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        };

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');
        const publicProfileUrl = `${baseUrl}/public/pet/${petId}`;
        const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(publicProfileUrl)}&size=200&dark=1e3a8a&light=ffffff&margin=1`;
        const logoUrl = `${baseUrl}/logo_transparent.png`;

        let petPhoto = pet.pet_photo;
        if (petPhoto && petPhoto.startsWith('/')) {
            petPhoto = `${baseUrl}${petPhoto}`;
        }
        if (!petPhoto) {
            petPhoto = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
        }

        const petCode = `RAM-${petId.substring(0, 8).toUpperCase()}`;

        return new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    backgroundColor: '#0f172a',
                    color: 'white',
                }}>
                    {/* Left Panel */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '320px',
                        padding: '30px',
                        backgroundColor: '#1e3a8a',
                    }}>
                        <div style={{
                            display: 'flex',
                            width: '180px',
                            height: '180px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            border: '4px solid rgba(255,255,255,0.2)',
                        }}>
                            <img src={petPhoto} width="180" height="180" style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ marginTop: '16px', fontSize: 32, fontWeight: 'bold', textAlign: 'center' }}>
                            {pet.pet_name}
                        </div>
                        <div style={{
                            marginTop: '10px',
                            padding: '6px 16px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '16px',
                            fontSize: 13,
                            fontWeight: 'bold',
                        }}>
                            {petCode}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        padding: '24px 32px',
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            paddingBottom: '16px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={logoUrl} width="40" height="40" style={{ borderRadius: '10px' }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>RAM</div>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Registro Animal Mundial</div>
                                </div>
                            </div>
                            <div style={{
                                padding: '5px 12px',
                                backgroundColor: 'rgba(34,197,94,0.2)',
                                borderRadius: '12px',
                                fontSize: 11,
                                fontWeight: 'bold',
                                color: '#4ade80',
                            }}>
                                ✓ VERIFICADO
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '12px', minWidth: '120px', flex: '1 1 45%' }}>
                                <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px' }}>RAZA</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{pet.breed || 'N/A'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '12px', minWidth: '80px', flex: '1 1 45%' }}>
                                <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px' }}>SEXO</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{pet.sex || 'N/A'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '12px', minWidth: '80px', flex: '1 1 45%' }}>
                                <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px' }}>COLOR</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{pet.color || 'N/A'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '12px', minWidth: '120px', flex: '1 1 45%' }}>
                                <div style={{ fontSize: 10, color: '#64748b', marginBottom: '4px' }}>NACIMIENTO</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{formatDate(pet.birth_date)}</div>
                            </div>
                        </div>

                        {/* QR Section */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginTop: '16px',
                            padding: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '8px',
                                borderRadius: '10px',
                                display: 'flex',
                            }}>
                                <img src={qrCodeUrl} width="70" height="70" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 13, fontWeight: 'bold', color: 'white' }}>Escanea para verificar</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>ram-weld-zeta.vercel.app</div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 900,
                height: 450,
            },
        );
    } catch (e) {
        console.error(e);
        return new Response('Failed to generate image: ' + e.message, { status: 500 });
    }
}
