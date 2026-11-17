import { NextResponse } from 'next/server';
import { getDb, seedDemoData } from '@/lib/db';

export async function POST() {
  try {
    const db = getDb();
    seedDemoData(db);
    return NextResponse.json({ success: true, message: 'Canciones de ejemplo cargadas correctamente.' });
  } catch (error: any) {
    console.error('Error al sembrar canciones de prueba:', error);
    return NextResponse.json({ error: error.message || 'Error al sembrar datos' }, { status: 500 });
  }
}
