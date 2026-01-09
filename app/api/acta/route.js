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
            return new Response('Server Configuration Error', { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch Pet and Owner Data joined
        const { data: pet, error } = await supabase
            .from('pets')
            .select(`
                *,
                user:users (
                    first_name,
                    last_name,
                    email,
                    phone,
                    city,
                    address,
                    detected_zone
                )
            `)
            .eq('pet_id', petId)
            .single();

        if (error || !pet) {
            return new Response('Pet not found', { status: 404 });
        }

        const formatDate = (dateString, isShort = false) => {
            if (!dateString) return 'XX/XX/XXXX';
            // Append T12:00:00 to avoid timezone shifts if it's just a date string "YYYY-MM-DD"
            const ds = dateString.length === 10 ? `${dateString}T12:00:00` : dateString;
            const date = new Date(ds);
            return date.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: isShort ? '2-digit' : '2-digit',
                year: 'numeric'
            });
        };

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');
        const verifyUrl = `${baseUrl}/verify/${pet.pet_id}`; // Or unique_registration_number if available
        const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=300&dark=000000&light=ffffff&margin=1`;
        const logoUrl = `${baseUrl}/images/logo.png`; // Fallback to provided logo path

        // Pet Photo
        let petPhoto = pet.pet_photo;
        if (petPhoto && petPhoto.startsWith('/')) {
            petPhoto = `${baseUrl}${petPhoto}`;
        }
        if (!petPhoto) petPhoto = 'https://ram-register.com/images/placeholder-paw.png'; // Valid placeholder if needed

        // Determine Owner Location
        const ownerLocation = pet.user?.detected_zone || pet.user?.address || pet.user?.city || 'No especificado';
        const ownerName = `${pet.user?.first_name || ''} ${pet.user?.last_name || ''}`.trim();
        const petCode = pet.microchip_number || `RAM-${pet.pet_id.substring(0, 8).toUpperCase()}`;

        // Styles
        const labelStyle = { fontSize: 10, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase' };
        const valueStyle = { fontSize: 14, fontWeight: 'bold', color: '#1e293b' };
        const sectionHeaderStyle = { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', width: '100%', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 };

        return new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#fff', // slate-50 equivalent
                    padding: '40px',
                    fontFamily: '"Inter", sans-serif',
                }}>
                    {/* Decorative Borders (simulated with absolute div is hard, use nested container with border) */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        height: '100%',
                        border: '2px solid #cbd5e1', // slate-300
                        padding: '4px',
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            border: '1px solid #e2e8f0', // slate-200
                            backgroundColor: '#f8fafc', // slate-50
                            padding: '30px',
                            justifyContent: 'space-between'
                        }}>

                            {/* HEADER */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    {/* Logo would go here if URL is absolute and accessible, text fallback for now */}
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>RAM</div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#334155', textTransform: 'uppercase' }}>Acta de Registro Animal</div>
                                </div>
                                <div style={{
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    padding: '4px 16px',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace'
                                }}>
                                    {petCode}
                                </div>
                            </div>

                            {/* PHOTO & QR */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 20 }}>
                                <div style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 60,
                                    border: '4px solid #e2e8f0',
                                    overflow: 'hidden',
                                    display: 'flex',
                                }}>
                                    <img src={petPhoto} width="120" height="120" style={{ objectFit: 'cover' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={qrCodeUrl} width="80" height="80" />
                                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>VERIFICAR</div>
                                </div>
                            </div>

                            {/* PET DATA */}
                            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                                <div style={sectionHeaderStyle}>Datos de la Mascota</div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {/* Row 1 */}
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Nombre</div>
                                            <div style={valueStyle}>{pet.pet_name}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Fecha de Nacimiento</div>
                                            <div style={valueStyle}>{formatDate(pet.birth_date)}</div>
                                        </div>
                                    </div>

                                    {/* Row 2 */}
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Sexo</div>
                                            <div style={{
                                                ...valueStyle,
                                                color: (pet.sex === 'Macho' || pet.sex === 'macho') ? '#1d4ed8' : '#be185d',
                                                backgroundColor: (pet.sex === 'Macho' || pet.sex === 'macho') ? '#dbeafe' : '#fce7f3',
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                fontSize: 12
                                            }}>
                                                {(pet.sex === 'Macho' || pet.sex === 'macho') ? 'M (Macho)' : 'H (Hembra)'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Lugar de Nacimiento</div>
                                            <div style={valueStyle}>{pet.city || 'No especificado'}</div>
                                        </div>
                                    </div>

                                    {/* Row 3 */}
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Raza</div>
                                            <div style={valueStyle}>{pet.breed || 'Mestizo'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Color</div>
                                            <div style={valueStyle}>{pet.color || 'No especificado'}</div>
                                        </div>
                                    </div>

                                    {/* Row 4 */}
                                    <div style={{ display: 'flex', width: '100%', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Señas Particulares</div>
                                            <div style={{ ...valueStyle, fontWeight: 'normal', fontSize: 13 }}>{pet.medical_notes || 'Ninguna'}</div>
                                        </div>
                                    </div>

                                    {/* Row 5 */}
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 0 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Raza Padre</div>
                                            <div style={valueStyle}>{pet.father_breed || 'No especificado'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 0 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Raza Madre</div>
                                            <div style={valueStyle}>{pet.mother_breed || 'No especificado'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* HUMAN DATA */}
                            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                                <div style={sectionHeaderStyle}>Humano Responsable</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ display: 'flex', width: '100%', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Nombre Completo</div>
                                            <div style={valueStyle}>{ownerName}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 0 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Email</div>
                                            <div style={{ ...valueStyle, fontSize: 12 }}>{pet.user?.email || 'No registrado'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', width: '48%', marginBottom: 0 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Celular</div>
                                            <div style={valueStyle}>{pet.user?.phone || 'No registrado'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', width: '100%', marginTop: 10 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={labelStyle}>Ubicación</div>
                                            <div style={valueStyle}>{ownerLocation}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Registro Animal Municipal</div>
                                    <div style={{ fontSize: 9, color: '#cbd5e1' }}>{formatDate(pet.created_at || new Date().toISOString())}</div>
                                </div>

                                <div style={{ display: 'flex', gap: 40 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: 100, height: 1, backgroundColor: '#cbd5e1', marginBottom: 4 }}></div>
                                        <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase' }}>Firma del Propietario</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: 100, height: 1, backgroundColor: '#cbd5e1', marginBottom: 4 }}></div>
                                        <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase' }}>Firma Autorizada</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ),
            {
                width: 600,
                height: 900, // Reduced height for image efficiency, standard A4 ratio approx
            }
        );
    } catch (e) {
        console.error(e);
        return new Response('Failed to generate Acta: ' + e.message, { status: 500 });
    }
}
