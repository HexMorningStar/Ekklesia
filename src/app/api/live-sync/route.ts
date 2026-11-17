import { NextRequest, NextResponse } from 'next/server';

export interface StageSyncState {
  songId?: string | number | null;
  songTitle?: string | null;
  songIndex?: number;
  activeSection?: string | null;
  cueType?: 'section' | 'dynamic' | 'navigation' | null;
  cueMessage?: string | null;
  timestamp: number;
  directorName?: string;
  serverTime: number;
}

// Estado global en memoria del servidor para sincronización en tiempo real de la banda
let currentStageState: StageSyncState = {
  songId: null,
  songTitle: null,
  songIndex: 0,
  activeSection: null,
  cueType: null,
  cueMessage: null,
  timestamp: Date.now(),
  directorName: 'Director de Alabanza',
  serverTime: Date.now()
};

export async function GET() {
  return NextResponse.json({
    success: true,
    state: {
      ...currentStageState,
      serverTime: Date.now()
    }
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      songId, 
      songTitle, 
      songIndex, 
      activeSection, 
      cueType, 
      cueMessage, 
      directorName 
    } = body;

    currentStageState = {
      songId: songId ?? currentStageState.songId,
      songTitle: songTitle ?? currentStageState.songTitle,
      songIndex: typeof songIndex === 'number' ? songIndex : currentStageState.songIndex,
      activeSection: activeSection ?? null,
      cueType: cueType ?? 'section',
      cueMessage: cueMessage ?? (activeSection ? `¡Vamos a ${activeSection}!` : null),
      directorName: directorName || currentStageState.directorName || 'Director de Alabanza',
      timestamp: Date.now(),
      serverTime: Date.now()
    };

    return NextResponse.json({
      success: true,
      message: 'Comando de dirección emitido con éxito a la banda',
      state: currentStageState
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Error procesando comando de escenario'
    }, { status: 400 });
  }
}
