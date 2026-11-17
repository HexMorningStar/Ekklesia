import { NextRequest, NextResponse } from 'next/server';
import { searchSongWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, apiKey, requestedKey, modelPreference } = body;

    if (!query || !query.trim()) {
      return NextResponse.json({ success: false, error: 'La consulta de búsqueda es requerida' }, { status: 400 });
    }

    const versions = await searchSongWithGemini(query.trim(), apiKey, requestedKey, modelPreference);
    return NextResponse.json({ success: true, versions, song: versions[0] });
  } catch (err: any) {
    console.error('Error en Gemini Song Search:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Error procesando la solicitud con Gemini'
    }, { status: 500 });
  }
}
