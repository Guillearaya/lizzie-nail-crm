import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { TIME_SLOTS } from '@/lib/constants';

// GET available slots for a specific date
export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ error: 'Parámetro date requerido' }, { status: 400 });
        }

        // Get booked slots
        const booked = db.prepare(
            'SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status != ?'
        ).all(date, 'cancelled').map(r => r.appointment_time);

        // Get blocked slots
        const blocked = db.prepare(
            'SELECT block_time FROM blocked_times WHERE block_date = ?'
        ).all(date).map(r => r.block_time);

        const unavailable = new Set([...booked, ...blocked]);

        const slots = TIME_SLOTS.map(slot => ({
            time: slot,
            available: !unavailable.has(slot),
        }));

        return NextResponse.json({ slots, date });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
