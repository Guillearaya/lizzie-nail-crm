import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { compareSync } from 'bcryptjs';

export async function POST(request) {
    try {
        const db = getDb();
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
        }

        const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

        if (!admin || !compareSync(password, admin.password_hash)) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Simple token-based auth (in production, use JWT)
        const token = Buffer.from(`${admin.id}:${admin.username}:${Date.now()}`).toString('base64');

        return NextResponse.json({
            success: true,
            user: { id: admin.id, username: admin.username, role: admin.role },
            token,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
