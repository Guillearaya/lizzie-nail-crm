import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { TIME_SLOTS } from '@/lib/constants';

// GET: Fetch appointments (with optional date filter)
export async function GET(request) {
    try {
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const clientPhone = searchParams.get('phone');

        let appointments;

        if (clientPhone) {
            appointments = db.prepare(`
        SELECT a.*, s.name as service_name, s.price, s.duration_minutes, c.full_name, c.phone, c.email
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN clients c ON a.client_id = c.id
        WHERE c.phone = ?
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
      `).all(clientPhone);
        } else if (date) {
            appointments = db.prepare(`
        SELECT a.*, s.name as service_name, s.price, s.duration_minutes, c.full_name, c.phone, c.email
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN clients c ON a.client_id = c.id
        WHERE a.appointment_date = ?
        ORDER BY a.appointment_time ASC
      `).all(date);
        } else {
            appointments = db.prepare(`
        SELECT a.*, s.name as service_name, s.price, s.duration_minutes, c.full_name, c.phone, c.email
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN clients c ON a.client_id = c.id
        WHERE a.appointment_date >= date('now')
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
        LIMIT 100
      `).all();
        }

        return NextResponse.json({ appointments });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new appointment
export async function POST(request) {
    try {
        const db = getDb();
        const body = await request.json();
        const { fullName, phone, email, serviceId, date, time, notes } = body;

        // Validations
        if (!fullName || !phone || !serviceId || !date || !time) {
            return NextResponse.json(
                { error: 'Campos requeridos: nombre, teléfono, servicio, fecha y hora' },
                { status: 400 }
            );
        }

        // Phone validation
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return NextResponse.json(
                { error: 'El teléfono debe tener al menos 10 dígitos' },
                { status: 400 }
            );
        }

        // Check if time slot is available
        const existing = db.prepare(
            'SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != ?'
        ).get(date, time, 'cancelled');

        if (existing) {
            return NextResponse.json(
                { error: 'Este horario ya está ocupado. Por favor, elige otro.' },
                { status: 409 }
            );
        }

        // Check blocked times
        const blocked = db.prepare(
            'SELECT id FROM blocked_times WHERE block_date = ? AND block_time = ?'
        ).get(date, time);

        if (blocked) {
            return NextResponse.json(
                { error: 'Este horario no está disponible.' },
                { status: 409 }
            );
        }

        // Get or create client
        let client = db.prepare('SELECT * FROM clients WHERE phone = ?').get(cleanPhone);

        if (!client) {
            const result = db.prepare(
                'INSERT INTO clients (full_name, phone, email) VALUES (?, ?, ?)'
            ).run(fullName, cleanPhone, email || null);
            client = { id: result.lastInsertRowid };
        } else {
            // Update client info
            db.prepare(
                'UPDATE clients SET full_name = ?, email = ?, updated_at = datetime("now") WHERE id = ?'
            ).run(fullName, email || client.email, client.id);
        }

        // Create appointment
        const apptResult = db.prepare(
            'INSERT INTO appointments (client_id, service_id, appointment_date, appointment_time, notes, status) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(client.id, serviceId, date, time, notes || null, 'confirmed');

        // Update client visit count
        db.prepare('UPDATE clients SET total_visits = total_visits + 1 WHERE id = ?').run(client.id);

        return NextResponse.json({
            success: true,
            appointmentId: Number(apptResult.lastInsertRowid),
            message: '¡Cita confirmada exitosamente!'
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update appointment status
export async function PATCH(request) {
    try {
        const db = getDb();
        const body = await request.json();
        const { appointmentId, status } = body;

        const validStatuses = ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
        }

        db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, appointmentId);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
