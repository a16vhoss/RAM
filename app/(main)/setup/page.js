
import db from '@/lib/db';

export default async function SetupPage() {
    let message = '';
    let error = null;

    try {
        // 1. Add status
        try {
            await db.query(`ALTER TABLE pets ADD COLUMN status VARCHAR(20) DEFAULT 'active';`);
            message += 'Added status column. ';
        } catch (e) {
            message += 'Status column check passed. ';
        }

        // 2. Create tables
        await db.query(`
            CREATE TABLE IF NOT EXISTS medical_records (
                record_id UUID PRIMARY KEY,
                pet_id UUID REFERENCES pets(pet_id) ON DELETE CASCADE,
                record_type VARCHAR(50) NOT NULL,
                description TEXT,
                date DATE DEFAULT CURRENT_DATE,
                next_due_date DATE,
                vet_name VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        message += 'Created medical_records. ';

        await db.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                alert_id UUID PRIMARY KEY,
                pet_id UUID REFERENCES pets(pet_id) ON DELETE CASCADE,
                type VARCHAR(20) DEFAULT 'LOST_PET',
                latitude FLOAT,
                longitude FLOAT,
                description TEXT,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        message += 'Created alerts. ';

    } catch (e) {
        error = e.message + '\n' + e.stack;
    }

    return (
        <div style={{ padding: 40, background: '#333', color: '#fff' }}>
            <h1>Migration Status</h1>
            {error ? (
                <pre style={{ color: 'red' }}>{error}</pre>
            ) : (
                <p style={{ color: 'green' }}>{message}</p>
            )}
        </div>
    );
}
