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

        // Format birth date
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        };

        // Base URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');
        const publicProfileUrl = `${baseUrl}/public/pet/${petId}`;

        // QR Code URL
        const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(publicProfileUrl)}&size=200&dark=1e40af&light=ffffff&margin=1`;

        // Logo URL
        const logoUrl = `${baseUrl}/icon.png`;

        // Pet Photo Processing
        let petPhoto = pet.pet_photo;
        if (petPhoto && petPhoto.startsWith('/')) {
            petPhoto = `${baseUrl}${petPhoto}`;
        }
        if (!petPhoto) {
            petPhoto = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
        }

        // Pet Code
        const petCode = `RAM-${petId.substring(0, 8).toUpperCase()}`;

        return new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    padding: '0',
                }}>
                    {/* Header with Logo and Company Name */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 40px',
                        backgroundColor: '#1e3a8a',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={logoUrl} width="50" height="50" style={{ borderRadius: '10px' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>RAM</div>
                                <div style={{ fontSize: 12, color: '#93c5fd' }}>Registro Animal Mundial</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ fontSize: 12, color: '#93c5fd' }}>CREDENCIAL OFICIAL</div>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{petCode}</div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flex: 1,
                        padding: '30px 40px',
                        gap: '40px',
                        alignItems: 'center',
                    }}>
                        {/* Pet Photo */}
                        <div style={{
                            display: 'flex',
                            width: '220px',
                            height: '220px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            backgroundColor: '#334155',
                            flexShrink: 0,
                        }}>
                            <img src={petPhoto} width="220" height="220" style={{ objectFit: 'cover' }} />
                        </div>

                        {/* Pet Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
                            <div style={{ fontSize: 48, fontWeight: 'bold', lineHeight: 1 }}>{pet.pet_name}</div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '12px', minWidth: '100px' }}>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>RAZA</div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{pet.breed || 'N/A'}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '12px', minWidth: '80px' }}>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>SEXO</div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{pet.sex || 'N/A'}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '12px', minWidth: '80px' }}>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>COLOR</div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{pet.color || 'N/A'}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '12px', minWidth: '120px' }}>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>NACIMIENTO</div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{formatDate(pet.birth_date)}</div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '12px',
                                borderRadius: '16px',
                                display: 'flex',
                            }}>
                                <img src={qrCodeUrl} width="120" height="120" />
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', textAlign: 'center' }}>Escanea para verificar</div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '12px',
                        backgroundColor: '#1e293b',
                        fontSize: 11,
                        color: '#64748b',
                    }}>
                        Este documento es propiedad de RAM Registro Animal Mundial. Verificable en ram-weld-zeta.vercel.app
                    </div>
                </div>
            ),
            {
                width: 1000,
                height: 500,
            },
        );
    } catch (e) {
        console.error(e);
        return new Response('Failed to generate image: ' + e.message, { status: 500 });
    }
}
