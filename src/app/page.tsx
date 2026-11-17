'use client';

import React, { useState, useEffect } from 'react';
import Navbar, { ActiveTab } from '@/components/Navbar';
import SongCatalog from '@/components/SongCatalog';
import SongViewer from '@/components/SongViewer';
import SongEditor from '@/components/SongEditor';
import SetlistManager from '@/components/SetlistManager';
import BibleReader from '@/components/BibleReader';
import GeminiSongSearchModal from '@/components/GeminiSongSearchModal';
import LiveStageMode from '@/components/LiveStageMode';
import SettingsModal from '@/components/SettingsModal';
import RehearsalAudioRecorderBar from '@/components/RehearsalAudioRecorderBar';
import HarmonicCircleModal from '@/components/HarmonicCircleModal';
import AndroidSyncModal from '@/components/AndroidSyncModal';
import InstrumentTunerModal from '@/components/InstrumentTunerModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import MinistryRecommendationsModal from '@/components/MinistryRecommendationsModal';
import SongAnalyticsModal from '@/components/SongAnalyticsModal';
import PdfExportModal from '@/components/PdfExportModal';
import ProjectionModal from '@/components/ProjectionModal';
import MultitrackPlayerModal from '@/components/MultitrackPlayerModal';
import SongTransitionModal from '@/components/SongTransitionModal';
import GuitarTabViewer from '@/components/GuitarTabViewer';
import { NotationType } from '@/lib/chord-engine';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('songs');
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modales
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState<boolean>(false);
  const [isSongEditorOpen, setIsSongEditorOpen] = useState<boolean>(false);
  const [editingSong, setEditingSong] = useState<any | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHarmonicCircleOpen, setIsHarmonicCircleOpen] = useState<boolean>(false);
  const [isAndroidSyncOpen, setIsAndroidSyncOpen] = useState<boolean>(false);
  const [isTunerOpen, setIsTunerOpen] = useState<boolean>(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState<boolean>(false);
  const [isProjectionOpen, setIsProjectionOpen] = useState<boolean>(false);
  const [isMultitrackOpen, setIsMultitrackOpen] = useState<boolean>(false);
  const [isSongTransitionOpen, setIsSongTransitionOpen] = useState<boolean>(false);
  const [isGuitarTabOpen, setIsGuitarTabOpen] = useState<boolean>(false);

  // Modo Atril / Escenario
  const [isLiveStageOpen, setIsLiveStageOpen] = useState<boolean>(false);
  const [liveSongs, setLiveSongs] = useState<any[]>([]);
  const [liveInitialNotation, setLiveInitialNotation] = useState<NotationType>('american');

  // Cargar datos
  const loadSongs = async () => {
    try {
      const res = await fetch('/api/songs');
      const data = await res.json();
      if (data.success) {
        setSongs(data.songs || []);
      }
    } catch (e) {
      console.error('Error cargando canciones:', e);
    }
  };

  const loadArtists = async () => {
    try {
      const res = await fetch('/api/artists');
      const data = await res.json();
      if (data.success) {
        setArtists(data.artists || []);
      }
    } catch (e) {
      console.error('Error cargando artistas:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadSongs(), loadArtists()]);
      setIsLoading(false);
    };
    init();
  }, []);

  // Manejo de lanzamiento de modo atril para una canción individual
  const handleLaunchSingleSongLiveMode = (song: any, semitones: number, notation: NotationType) => {
    setLiveSongs([song]);
    setLiveInitialNotation(notation);
    setIsLiveStageOpen(true);
  };

  // Manejo de lanzamiento de modo atril para un setlist completo
  const handleLaunchSetlistLiveMode = (setlistSongs: any[], setlistTitle: string) => {
    setLiveSongs(setlistSongs);
    setLiveInitialNotation('american');
    setIsLiveStageOpen(true);
  };

  // Vincular pasaje de la biblia a nueva canción
  const handleSelectPassageForSong = (reference: string) => {
    setEditingSong({
      scripture_reference: reference,
      title: `Cántico basado en ${reference}`,
      original_key: 'G',
      tempo: 72,
      time_signature: '4/4',
      content: `[Intro]\n[G]  [C]  [G]  [D]\n\n[Verso 1]\n[G]Medito en Tu palabra, Señor\n[C]Que es lámpara a mis [G]pies\n\n[Coro]\n[G]Alabaré Tu Santo [C]Nombre\n[Em]Grande es Tu fideli[D]dad`,
      notes: `Inspirado en ${reference}`
    });
    setIsSongEditorOpen(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Barra superior de navegación */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'songs') {
            setSelectedSong(null);
          }
        }}
        onOpenGeminiSearch={() => setIsGeminiModalOpen(true)}
        onOpenCreateSong={() => {
          setEditingSong(null);
          setIsSongEditorOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHarmonicCircle={() => setIsHarmonicCircleOpen(true)}
        onOpenAndroidSync={() => setIsAndroidSyncOpen(true)}
        onOpenTuner={() => setIsTunerOpen(true)}
        onOpenRecommendations={() => setIsRecommendationsOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenPdfExport={() => setIsPdfExportOpen(true)}
        onOpenMultitrack={() => setIsMultitrackOpen(true)}
        onOpenSongTransition={() => setIsSongTransitionOpen(true)}
        onOpenGuitarTab={() => setIsGuitarTabOpen(true)}
      />

      {/* Área de trabajo dinámica con padding responsivo para la barra inferior móvil */}
      <main className="flex-1 overflow-hidden p-2.5 sm:p-4 md:p-6 pb-20 md:pb-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
              <p className="text-xs text-slate-400">Cargando Ekklesia Music...</p>
            </div>
          </div>
        ) : activeTab === 'songs' ? (
          selectedSong ? (
            <SongViewer
              song={selectedSong}
              onBack={() => setSelectedSong(null)}
              onEdit={(s) => {
                setEditingSong(s);
                setIsSongEditorOpen(true);
              }}
              onLaunchLiveMode={handleLaunchSingleSongLiveMode}
            />
          ) : (
            <SongCatalog
              songs={songs}
              artists={artists}
              selectedSong={selectedSong}
              onSelectSong={(s) => setSelectedSong(s)}
              onOpenCreateSong={() => {
                setEditingSong(null);
                setIsSongEditorOpen(true);
              }}
              onOpenGeminiSearch={() => setIsGeminiModalOpen(true)}
              onDeleteSong={async (id) => {
                await fetch(`/api/songs/${id}`, { method: 'DELETE' });
                await Promise.all([loadSongs(), loadArtists()]);
                if (selectedSong?.id === id) setSelectedSong(null);
              }}
            />
          )
        ) : activeTab === 'setlists' ? (
          <SetlistManager
            availableSongs={songs}
            onLaunchLiveStage={handleLaunchSetlistLiveMode}
          />
        ) : activeTab === 'bible' ? (
          <BibleReader onSelectPassageForSong={handleSelectPassageForSong} />
        ) : null}
      </main>

      {/* Barra de Navegación Inferior Nativa para Móviles (Galaxy S25 Ultra, etc.) */}
      {!isLiveStageOpen && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'songs') {
              setSelectedSong(null);
            }
          }}
          onOpenHarmonicCircle={() => setIsHarmonicCircleOpen(true)}
          onOpenGeminiSearch={() => setIsGeminiModalOpen(true)}
        />
      )}

      {/* Modal Buscador Inteligente Gemini */}
      <GeminiSongSearchModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onSongSaved={async (savedSong) => {
          await Promise.all([loadSongs(), loadArtists()]);
          setSelectedSong(savedSong);
          setActiveTab('songs');
        }}
      />

      {/* Modal Editor / Creador de Canciones */}
      <SongEditor
        isOpen={isSongEditorOpen}
        song={editingSong}
        artists={artists}
        onClose={() => {
          setIsSongEditorOpen(false);
          setEditingSong(null);
        }}
        onSaved={async () => {
          await Promise.all([loadSongs(), loadArtists()]);
        }}
      />

      {/* Grabadora flotante de ensayos (disponible en cancionero y gestor) */}
      {!isLiveStageOpen && (
        <RehearsalAudioRecorderBar currentSongTitle={selectedSong?.title} />
      )}

      {/* Modal Configuración */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Modal Círculo Armónico y Acompañamiento Espontáneo */}
      <HarmonicCircleModal
        isOpen={isHarmonicCircleOpen}
        onClose={() => setIsHarmonicCircleOpen(false)}
        initialKey={selectedSong?.chosen_key || selectedSong?.original_key || 'G'}
      />

      {/* Modal EKKLESIA para Android (Descarga de APK y Sincronización) */}
      <AndroidSyncModal
        isOpen={isAndroidSyncOpen}
        onClose={() => setIsAndroidSyncOpen(false)}
        serverUrl="http://192.168.0.15:3000"
        tunnelUrl="https://nascar-techniques-tennessee-sanyo.trycloudflare.com"
      />

      {/* Modal Afinador Cromático Digital */}
      <InstrumentTunerModal
        isOpen={isTunerOpen}
        onClose={() => setIsTunerOpen(false)}
      />

      {/* Modal Centro de Recomendaciones y Novedades (10/10) */}
      <MinistryRecommendationsModal
        isOpen={isRecommendationsOpen}
        onClose={() => setIsRecommendationsOpen(false)}
        onOpenLiveStage={() => {
          if (songs.length > 0) {
            handleLaunchSingleSongLiveMode(selectedSong || songs[0], 0, 'american');
          }
        }}
        onOpenTuner={() => setIsTunerOpen(true)}
        onOpenHarmonicCircle={() => setIsHarmonicCircleOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenPdfExport={() => setIsPdfExportOpen(true)}
        onOpenProjection={() => setIsProjectionOpen(true)}
        onOpenMultitrack={() => setIsMultitrackOpen(true)}
        onOpenSongTransition={() => setIsSongTransitionOpen(true)}
        onOpenGuitarTab={() => setIsGuitarTabOpen(true)}
      />

      {/* Modal Analítica y Rotación de Alabanzas */}
      <SongAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        songs={songs}
      />

      {/* Modal Exportación de Cancionero PDF e Impresión */}
      <PdfExportModal
        isOpen={isPdfExportOpen}
        onClose={() => setIsPdfExportOpen(false)}
        songs={songs}
        title="Cancionero Ekklesia Music"
      />

      {/* Modal Proyección Congregacional y Transmisión */}
      <ProjectionModal
        isOpen={isProjectionOpen}
        songs={songs}
        currentSongIndex={selectedSong ? Math.max(0, songs.findIndex(s => s.id === selectedSong.id)) : 0}
        onClose={() => setIsProjectionOpen(false)}
      />

      {/* Modal Reproductor Multi-Pistas (Multitrack Player / Click & Cues) */}
      <MultitrackPlayerModal
        isOpen={isMultitrackOpen}
        onClose={() => setIsMultitrackOpen(false)}
        songTitle={selectedSong?.title}
        initialKey={selectedSong?.chosen_key || selectedSong?.original_key || 'G'}
        initialBpm={selectedSong?.tempo || 72}
      />

      {/* Modal Generador de Transiciones y Modulaciones Asistido */}
      <SongTransitionModal
        isOpen={isSongTransitionOpen}
        onClose={() => setIsSongTransitionOpen(false)}
        songs={songs}
        initialSourceSong={selectedSong || songs[0]}
        initialTargetSong={songs.length > 1 ? songs[1] : undefined}
      />

      {/* Modal Visualizador de Tablaturas y Riffs Icónicos */}
      <GuitarTabViewer
        isOpen={isGuitarTabOpen}
        onClose={() => setIsGuitarTabOpen(false)}
        songTitle={selectedSong?.title}
        onInsertTabIntoSong={(tab) => {
          if (selectedSong) {
            setSelectedSong({
              ...selectedSong,
              content: `${selectedSong.content}\n\n[Intro Tab]\n${tab}`
            });
          }
          setIsGuitarTabOpen(false);
        }}
      />

      {/* Pantalla Completa Modo Atril / Escenario */}
      {isLiveStageOpen && (
        <LiveStageMode
          songs={liveSongs}
          initialNotation={liveInitialNotation}
          onClose={() => setIsLiveStageOpen(false)}
        />
      )}
    </div>
  );
}
