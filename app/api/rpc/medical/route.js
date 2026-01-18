import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let action, data;
    // Check if multipart (for file uploads if addMedicalRecord supported it, but it used JSON for attachments)
    // The original `addMedicalRecord` took FormData but attachments were in `attachments_json` string.
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        action = formData.get('action');
        data = formData;
    } else {
        const json = await request.json();
        action = json.action;
        data = json.data;
    }

    try {
        switch (action) {
            case 'getMedicalRecords':
                const records = await db.getAll('SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date DESC', [data.petId]);
                return NextResponse.json({ success: true, data: records || [] });

            case 'addMedicalRecord': {
                // data is FormData
                const petId = data.get('pet_id');
                const type = data.get('type');
                const description = data.get('description');
                const date = data.get('date');
                const vetName = data.get('vet_name');
                let attachments = [];
                try { attachments = JSON.parse(data.get('attachments_json') || '[]'); } catch (e) { }

                await db.query(`INSERT INTO medical_records (pet_id, record_type, description, date, vet_name, attachments) VALUES ($1, $2, $3, $4, $5, $6)`,
                    [petId, type, description || '', date, vetName || '', JSON.stringify(attachments)]);
                return NextResponse.json({ success: true });
            }

            case 'updateMedicalRecord': {
                const recordId = data.get('record_id');
                const petId = data.get('pet_id');
                const type = data.get('type');
                const description = data.get('description');
                const date = data.get('date');
                const vetName = data.get('vet_name');
                let attachments = [];
                try { attachments = JSON.parse(data.get('attachments_json') || '[]'); } catch (e) { }

                await db.query(`UPDATE medical_records SET record_type = $1, description = $2, date = $3, vet_name = $4, attachments = $5 WHERE record_id = $6 AND pet_id = $7`,
                    [type, description || '', date, vetName || '', JSON.stringify(attachments), recordId, petId]);
                return NextResponse.json({ success: true });
            }

            case 'deleteMedicalRecord':
                await db.query('DELETE FROM medical_records WHERE record_id = $1 AND pet_id = $2', [data.recordId, data.petId]);
                return NextResponse.json({ success: true });

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error(`RPC Medical error ${action}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
