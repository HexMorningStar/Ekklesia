import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const artists = db.prepare(`
      SELECT a.*, COUNT(s.id) as song_count
      FROM artists a
      LEFT JOIN songs s ON a.id = s.artist_id
      GROUP BY a.id
      ORDER BY a.name ASC
    `).all();

    return NextResponse.json({ success: true, artists });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { name, bio = '', imageUrl = null } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'El nombre del artista es obligatorio' }, { status: 400 });
    }

    const res = db.prepare(`
      INSERT INTO artists (name, bio, image_url)
      VALUES (?, ?, ?)
    `).run(name.trim(), bio.trim(), imageUrl);

    return NextResponse.json({
      success: true,
      artistId: res.lastInsertRowid,
      message: 'Artista agregado con éxito'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
