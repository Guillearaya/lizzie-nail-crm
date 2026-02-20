import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET: Dashboard stats
export async function GET() {
    try {
        const db = getDb();

        const todayAppts = db.prepare(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE appointment_date = date('now') AND status != 'cancelled'
    `).get();

        const weekAppts = db.prepare(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE appointment_date BETWEEN date('now') AND date('now', '+7 days') AND status != 'cancelled'
    `).get();

        const totalClients = db.prepare('SELECT COUNT(*) as count FROM clients').get();

        const monthRevenue = db.prepare(`
      SELECT COALESCE(SUM(s.price), 0) as total 
      FROM appointments a 
      JOIN services s ON a.service_id = s.id 
      WHERE a.appointment_date BETWEEN date('now', 'start of month') AND date('now', 'start of month', '+1 month', '-1 day')
      AND a.status IN ('confirmed', 'completed')
    `).get();

        const upcomingAppts = db.prepare(`
      SELECT a.*, s.name as service_name, s.price, c.full_name, c.phone
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN clients c ON a.client_id = c.id
      WHERE a.appointment_date >= date('now') AND a.status != 'cancelled'
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 10
    `).all();

        const popularServices = db.prepare(`
      SELECT s.name, COUNT(a.id) as bookings, s.price
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id AND a.status != 'cancelled'
      WHERE s.is_active = 1
      GROUP BY s.id
      ORDER BY bookings DESC
      LIMIT 5
    `).all();

        return NextResponse.json({
            stats: {
                todayAppointments: todayAppts.count,
                weekAppointments: weekAppts.count,
                totalClients: totalClients.count,
                monthRevenue: monthRevenue.total,
            },
            upcomingAppointments: upcomingAppts,
            popularServices,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
