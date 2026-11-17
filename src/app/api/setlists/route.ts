import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const setlists = db.prepare(`
      SELECT s.*, COUNT(i.id) as songs_count
      FROM setlists s
      LEFT JOIN setlist_items i ON s.id = i.setlist_id
      GROUP BY s.id
      ORDER BY s.event_date DESC, s.created_at DESC
    `).all();

    return NextResponse.json({ success: true, setlists });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const {
      title,
      description = '',
      eventDate = new Date().toISOString().split('T')[0],
      serviceType = 'Culto General',
      items = [] // Array de { songId, chosenKey, performanceNotes, bpm, orderIndex }
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'El nombre del setlist/evento es requerido' }, { status: 400 });
    }

    const insertTx = db.transaction(() => {
      const s = db.prepare(`
        INSERT INTO setlists (title, description, event_date, service_type)
        VALUES (?, ?, ?, ?)
      `).run(title.trim(), description.trim(), eventDate, serviceType);

      const setlistId = s.lastInsertRowid;

      if (Array.isArray(items) && items.length > 0) {
        const insertItem = db.prepare(`
          INSERT INTO setlist_items (setlist_id, song_id, order_index, chosen_key, performance_notes, bpm)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        items.forEach((item: any, idx: number) => {
          insertItem.run(
            setlistId,
            item.songId,
            item.orderIndex ?? (idx + 1),
            item.chosenKey || 'G',
            item.performanceNotes || '',
            item.bpm || 72
          );
        });
      }

      return setlistId;
    });

    const setlistId = insertTx();

    return NextResponse.json({
      success: true,
      setlistId,
      message: 'Setlist creado exitosamente'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
