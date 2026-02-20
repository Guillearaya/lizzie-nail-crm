import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const db = getDb();
        const services = db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY category, price').all();
        return NextResponse.json({ services });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
