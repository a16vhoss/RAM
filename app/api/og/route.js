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

        // Calculate Age
        const calculateAge = (birthDate) => {
            if (!birthDate) return 'N/A';
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return `${age} Años`;
        };

        const age = calculateAge(pet.birth_date);

        // Base URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const publicProfileUrl = `${baseUrl}/public/pet/${petId}`;

        // QR Code URL (Direct Image)
        const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(publicProfileUrl)}&size=200&dark=000000&light=ffffff&margin=1`;

        // Pet Photo Processing
        let petPhoto = pet.pet_photo;
        if (petPhoto && petPhoto.startsWith('/')) {
            petPhoto = `${baseUrl}${petPhoto}`;
        }
        if (!petPhoto) {
            petPhoto = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
        }

        return new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    padding: '40px',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '30px' }}>
                        <div style={{
                            display: 'flex',
                            width: '200px',
                            height: '200px',
                            borderRadius: '100px',
                            overflow: 'hidden',
                            backgroundColor: '#333333',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img src={petPhoto} width="200" height="200" style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#aaaaaa' }}>ID OFICIAL</div>
                            <div style={{ fontSize: 40, fontWeight: 'bold', lineHeight: 1.1 }}>{pet.pet_name}</div>
                            <div style={{ fontSize: 20, color: '#cccccc' }}>{pet.breed}</div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <div style={{ padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>{pet.sex}</div>
                                <div style={{ padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>{age}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '16px',
                        width: '164px',
                        height: '164px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'black'
                    }}>
                        <img src={qrCodeUrl} width="140" height="140" />
                    </div>
                </div>
            ),
            {
                width: 1000,
                height: 600,
            },
        );
    } catch (e) {
        console.error(e);
        return new Response('Failed to generate image: ' + e.message, { status: 500 });
    }
}
