'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Maximize, 
  Minimize,
  Music,
  Clock,
  Radio,
  FileText,
  Sliders,
  Tv,
  Guitar,
  Compass,
  Crown,
  Users,
  Wifi,
  WifiOff,
  Flame,
  Check,
  Zap,
  Timer,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { 
  parseSongContent, 
  NotationType, 
  transposeNote, 
  NOTE_TO_SOLFA,
  INSTRUMENTS,
  InstrumentKey,
  CapoOption
} from '@/lib/chord-engine';
import { getAmbientPadEngine } from '@/lib/ambient-pad-engine';
import { getVoiceMetronome } from '@/lib/voice-metronome';
import { usePedalController } from '@/lib/pedal-controller';
import ChordDiagramModal from './ChordDiagramModal';
import CapoCalculatorModal from './CapoCalculatorModal';
import ProjectionModal from './ProjectionModal';
import RehearsalAudioRecorderBar from './RehearsalAudioRecorderBar';
import HarmonicCircleModal from './HarmonicCircleModal';
import InstrumentTunerModal from './InstrumentTunerModal';
import GuitarTabViewer from './GuitarTabViewer';
import MultitrackPlayerModal from './MultitrackPlayerModal';
import SongTransitionModal from './SongTransitionModal';
import RehearsalSyncModal from './RehearsalSyncModal';
import { getP2PSyncEngine } from '@/lib/p2p-sync-engine';

interface LiveStageModeProps {
  songs: any[];
  initialIndex?: number;
  initialNotation?: NotationType;
  onClose: () => void;
}

export default function LiveStageMode({
  songs,
  initialIndex = 0,
  initialNotation = 'american',
  onClose
}: LiveStageModeProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [notation, setNotation] = useState<NotationType>(initialNotation);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentKey>('C');
  const [semitones, setSemitones] = useState<number>(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(4);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chords' | 'sheet'>('chords');

  // Modales adicionales: Capo, Proyección, Círculo Armónico, Afinador, Tablaturas, Secuencias y Transiciones
  const [isCapoModalOpen, setIsCapoModalOpen] = useState<boolean>(false);
  const [activeCapoFret, setActiveCapoFret] = useState<number | null>(null);
  const [activeCapoShape, setActiveCapoShape] = useState<string | null>(null);
  const [isProjectionOpen, setIsProjectionOpen] = useState<boolean>(false);
  const [isHarmonicCircleOpen, setIsHarmonicCircleOpen] = useState<boolean>(false);
  const [isTunerOpen, setIsTunerOpen] = useState<boolean>(false);
  const [isGuitarTabOpen, setIsGuitarTabOpen] = useState<boolean>(false);
  const [isMultitrackOpen, setIsMultitrackOpen] = useState<boolean>(false);
  const [isTransitionOpen, setIsTransitionOpen] = useState<boolean>(false);
  const [isRehearsalModalOpen, setIsRehearsalModalOpen] = useState<boolean>(false);

  // Sistema de Dirección en Vivo (Director vs Músico)
  const [stageRole, setStageRole] = useState<'director' | 'musician'>('director');
  const [autoFollowSong, setAutoFollowSong] = useState<boolean>(true);
  const [activeBroadcastSection, setActiveBroadcastSection] = useState<string | null>(null);
  const [activeDirectorCue, setActiveDirectorCue] = useState<{
    message: string;
    type: string;
    timestamp: number;
    section?: string | null;
  } | null>(null);
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<number>(0);
  const [syncConnected, setSyncConnected] = useState<boolean>(true);

  // Reloj y Cronómetro de Escenario
  const [currentTimeString, setCurrentTimeString] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(20 * 60); // 20 minutos por defecto
  const [timerInitialSeconds, setTimerInitialSeconds] = useState<number>(20 * 60);
  const [isTimerPopoverOpen, setIsTimerPopoverOpen] = useState<boolean>(false);

  // Metrónomo Web Audio API & Voz Ministerial
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [metronomeMode, setMetronomeMode] = useState<'click' | 'voice'>('click');
  const [beatPulse, setBeatPulse] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const voiceMetronome = useRef(getVoiceMetronome());

  // Ambient Worship Pad
  const [isPadPlaying, setIsPadPlaying] = useState<boolean>(false);
  const padEngine = useRef(getAmbientPadEngine());

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const metronomeTimerRef = useRef<any>(null);

  const currentSong = songs[currentIndex] || songs[0];
  const songBpm = currentSong?.item_bpm || currentSong?.tempo || 72;

  // Instrumento transpositor
  const instrumentInfo = INSTRUMENTS.find(i => i.id === selectedInstrument) || INSTRUMENTS[0];
  const instrumentSemitones = instrumentInfo.transpositionSemitones;

  // Tono de concierto
  const concertKey = transposeNote(currentSong?.chosen_key || currentSong?.original_key || 'G', semitones);
  // Tono para el atril del músico
  const effectiveKey = transposeNote(concertKey, instrumentSemitones);

  // Total de semitonos de transposición aplicados al texto
  const totalSemitones = semitones + instrumentSemitones;

  // Reset transposición y scroll al cambiar de canción
  useEffect(() => {
    setSemitones(0);
    setActiveCapoFret(null);
    setActiveCapoShape(null);
    setIsAutoScrolling(false);
    setViewMode('chords');
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  const handleApplyCapo = (fret: number, shape: string) => {
    setActiveCapoFret(fret);
    setActiveCapoShape(shape);
    setSemitones(-fret);
  };

  // Pedales Bluetooth (AirTurn / PageFlip / Donner) y Controladores MIDI
  usePedalController({
    onNextSong: () => {
      if (songs.length > 1 && currentIndex < songs.length - 1) {
        setCurrentIndex(i => i + 1);
      } else if (containerRef.current) {
        containerRef.current.scrollBy({ top: 300, behavior: 'smooth' });
      }
    },
    onPrevSong: () => {
      if (currentIndex > 0) {
        setCurrentIndex(i => i - 1);
      } else if (containerRef.current) {
        containerRef.current.scrollBy({ top: -300, behavior: 'smooth' });
      }
    },
    onScrollDown: () => {
      if (containerRef.current) containerRef.current.scrollBy({ top: 220, behavior: 'smooth' });
    },
    onScrollUp: () => {
      if (containerRef.current) containerRef.current.scrollBy({ top: -220, behavior: 'smooth' });
    },
    onToggleScroll: () => setIsAutoScrolling(prev => !prev),
    onTogglePad: () => toggleAmbientPad(),
  });

  // Manejo de Auto-scroll
  useEffect(() => {
    if (isAutoScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollBy({ top: 1, behavior: 'smooth' });
        }
      }, Math.max(15, 75 - scrollSpeed * 6));
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Actualizar Pad al cambiar de canción o tonalidad
  useEffect(() => {
    if (isPadPlaying) {
      padEngine.current.play(concertKey);
    }
  }, [concertKey, isPadPlaying]);

  useEffect(() => {
    return () => {
      padEngine.current.stop();
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    };
  }, []);

  const toggleAmbientPad = () => {
    if (isPadPlaying) {
      padEngine.current.stop();
      setIsPadPlaying(false);
    } else {
      padEngine.current.play(concertKey);
      setIsPadPlaying(true);
    }
  };

  // Metrónomo sonoro y visual (Web Audio API / Conteo Vocal)
  useEffect(() => {
    if (!isMetronomeActive) {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
      return;
    }

    const intervalMs = (60 / songBpm) * 1000;
    let beat = 1;

    // Inicializar AudioContext
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }

    const playClick = (accent = false) => {
      if (isAudioMuted || !audioContextRef.current) return;
      try {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);

        osc.frequency.value = accent ? 880 : 440; // Beat 1 más agudo
        gain.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.05);

        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.05);
      } catch (e) {
        console.error('Audio click error:', e);
      }
    };

    const playPulse = (beatNum: number) => {
      if (isAudioMuted) return;
      if (metronomeMode === 'voice') {
        voiceMetronome.current.speakBeat(beatNum);
      } else {
        playClick(beatNum === 1);
      }
    };

    // Primer pulso inmediato
    playPulse(beat);
    setBeatPulse(true);
    setTimeout(() => setBeatPulse(false), 100);

    metronomeTimerRef.current = setInterval(() => {
      beat = (beat % 4) + 1;
      setCurrentBeat(beat);
      setBeatPulse(true);
      playPulse(beat);
      setTimeout(() => setBeatPulse(false), 100);
    }, intervalMs);

    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    };
  }, [isMetronomeActive, songBpm, isAudioMuted, metronomeMode]);

  // Restaurar rol persistido (director o músico)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('ekklesia_stage_role');
      if (savedRole === 'director' || savedRole === 'musician') {
        setStageRole(savedRole);
      }
    }
  }, []);

  // Integración con el botón "Atrás" del sistema Android, navegador y gestos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'liveStage' }, '');

      const handlePopState = () => {
        onClose();
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [onClose]);

  const handleExit = () => {
    if (typeof window !== 'undefined' && window.history.state?.modal === 'liveStage') {
      window.history.back();
    } else {
      onClose();
    }
  };

  // Manejador de Gestos Táctiles Móviles (Swipe desde borde izquierdo para salir, o swipe horizontal para cambiar canción)
  const touchStartRef = useRef<{ x: number; y: number; time: number; isEdge: boolean } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      isEdge: touch.clientX < 55 // Detección de inicio en el borde izquierdo (borde de retorno de Android)
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;

    // 1. Gesto de retroceso: Deslizamiento desde el borde izquierdo hacia la derecha
    if (touchStartRef.current.isEdge && deltaX > 65 && Math.abs(deltaY) < 65) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(40); } catch (err) {}
      }
      handleExit();
      touchStartRef.current = null;
      return;
    }

    // 2. Gesto de cambio de canción: Deslizamiento horizontal rápido en la pantalla
    if (Math.abs(deltaX) > 110 && Math.abs(deltaY) < 55 && elapsed < 450) {
      if (deltaX < -110 && currentIndex < songs.length - 1) {
        setCurrentIndex(i => i + 1);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(30); } catch (err) {}
        }
      } else if (deltaX > 110 && currentIndex > 0) {
        setCurrentIndex(i => i - 1);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(30); } catch (err) {}
        }
      }
    }

    touchStartRef.current = null;
  };

  // Reloj del sistema en vivo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Cronómetro de escenario
  useEffect(() => {
    let timerInterval: any = null;
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number): string => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return isNegative ? `-${formatted}` : formatted;
  };

  const parsedContent = currentSong ? parseSongContent(currentSong.content || '', totalSemitones, notation, effectiveKey) : [];

  // Extraer secciones únicas de la canción actual para la botonera del director
  const songSections = useMemo(() => {
    const sections: string[] = [];
    parsedContent.forEach(line => {
      if (line.type === 'section' && line.sectionName) {
        const clean = line.sectionName.trim();
        if (!sections.includes(clean)) {
          sections.push(clean);
        }
      }
    });
    return sections;
  }, [parsedContent]);

  // Desplazamiento suave al elemento de una sección
  const scrollToSection = (sectionName: string) => {
    if (!containerRef.current) return;
    const clean = sectionName.replace(/[\[\]]/g, '').trim().toLowerCase().replace(/\s+/g, '-');
    const el = containerRef.current.querySelector(`[data-section-id="${clean}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Función del Director para transmitir sección o dinámica en vivo
  const broadcastCue = async (
    sectionName?: string | null,
    customMessage?: string,
    cueType: 'section' | 'dynamic' = 'section'
  ) => {
    try {
      const normalizedSection = sectionName || null;
      const message = customMessage || (normalizedSection ? `¡Vamos a ${normalizedSection}!` : 'Atención banda');
      setActiveBroadcastSection(normalizedSection);
      setActiveDirectorCue({
        message,
        type: cueType,
        timestamp: Date.now(),
        section: normalizedSection
      });

      if (normalizedSection) {
        scrollToSection(normalizedSection);
      }

      // Transmitir inmediatamente vía motor P2P descentralizado
      getP2PSyncEngine().broadcastAction({
        songId: currentSong?.id,
        songTitle: currentSong?.title,
        songIndex: currentIndex,
        activeSection: normalizedSection,
        cueType,
        cueMessage: message
      });

      await fetch('/api/live-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: currentSong?.id,
          songTitle: currentSong?.title,
          songIndex: currentIndex,
          activeSection: normalizedSection,
          cueType,
          cueMessage: message,
          directorName: 'Director de Alabanza'
        })
      }).catch(() => {});
    } catch (err) {
      console.error('Error broadcasting stage cue:', err);
    }
  };

  // Polling de sincronización en tiempo real (/api/live-sync) para todos los atriles conectados
  useEffect(() => {
    let isMounted = true;
    const pollSync = async () => {
      try {
        const res = await fetch('/api/live-sync', { cache: 'no-store' });
        if (!res.ok) throw new Error('Sync error');
        const data = await res.json();
        if (!isMounted || !data.success || !data.state) return;
        setSyncConnected(true);

        const state = data.state;
        if (state.timestamp && state.timestamp > lastSyncedTimestamp) {
          setLastSyncedTimestamp(state.timestamp);

          // Si es una señal nueva de dirección
          if (state.cueMessage || state.activeSection) {
            setActiveDirectorCue({
              message: state.cueMessage || `¡Vamos a ${state.activeSection}!`,
              type: state.cueType || 'section',
              timestamp: state.timestamp,
              section: state.activeSection
            });

            if (state.activeSection) {
              setActiveBroadcastSection(state.activeSection);
              scrollToSection(state.activeSection);
            }

            // Vibración háptica en celulares y tablets Android (Galaxy S25 Ultra, etc.)
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([140, 70, 140]);
              } catch (e) {}
            }
          }

          // Si el director cambió de canción y estamos en modo músico con auto-follow activado
          if (
            stageRole === 'musician' &&
            autoFollowSong &&
            typeof state.songIndex === 'number' &&
            state.songIndex !== currentIndex &&
            songs[state.songIndex]
          ) {
            setCurrentIndex(state.songIndex);
          }
        }
      } catch (e) {
        if (isMounted) setSyncConnected(false);
      }
    };

    const interval = setInterval(pollSync, 950);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lastSyncedTimestamp, stageRole, autoFollowSong, currentIndex, songs]);

  // Suscripción al Motor P2P Descentralizado (BroadcastChannel / Storage / P2P Mesh)
  useEffect(() => {
    const syncEngine = getP2PSyncEngine();
    const unsubscribe = syncEngine.subscribe((state) => {
      if (stageRole === 'musician' && state.timestamp) {
        if (state.cueMessage || state.activeSection) {
          setActiveDirectorCue({
            message: state.cueMessage || `¡Vamos a ${state.activeSection}!`,
            type: state.cueType || 'section',
            timestamp: state.timestamp,
            section: state.activeSection
          });

          if (state.activeSection) {
            setActiveBroadcastSection(state.activeSection);
            scrollToSection(state.activeSection);
          }

          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate([140, 70, 140]); } catch (e) {}
          }
        }

        if (
          autoFollowSong &&
          typeof state.songIndex === 'number' &&
          state.songIndex !== currentIndex &&
          songs[state.songIndex]
        ) {
          setCurrentIndex(state.songIndex);
        }
      }
    });

    return () => unsubscribe();
  }, [stageRole, autoFollowSong, currentIndex, songs]);

  // Auto-ocultar el banner flotante HUD del director después de 7 segundos
  useEffect(() => {
    if (activeDirectorCue) {
      const timer = setTimeout(() => {
        setActiveDirectorCue(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeDirectorCue]);

  // Auto-limpiar el resalte de sección después de 18 segundos
  useEffect(() => {
    if (activeBroadcastSection) {
      const timer = setTimeout(() => {
        setActiveBroadcastSection(null);
      }, 18000);
      return () => clearTimeout(timer);
    }
  }, [activeBroadcastSection]);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex flex-col bg-black text-slate-100 select-none overflow-hidden font-sans"
    >
      {/* Barra superior de atril en vivo */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shrink-0 pt-[max(0.4rem,env(safe-area-inset-top))]">
        {/* Fila principal */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-2">
          {/* Izquierda: Volver, título de la canción y selector de Rol */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 px-3 py-1.5 text-xs sm:text-sm font-bold text-white border border-slate-700 transition shrink-0 shadow-sm"
              title="Volver al cancionero (o desliza desde el borde izquierdo hacia la derecha)"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400 stroke-[2.5]" />
              <span>Volver</span>
            </button>

            {/* Selector de Rol Director / Músico y Sala P2P */}
            <button
              onClick={() => setIsRehearsalModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition border shadow-sm shrink-0 ${
                stageRole === 'director'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30'
              }`}
              title="Abrir sala de ensayo P2P y código QR"
            >
              {stageRole === 'director' ? (
                <>
                  <Crown className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Director (QR)</span>
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Músico (P2P)</span>
                </>
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate max-w-[110px] sm:max-w-md">
                  {currentSong?.title}
                </h2>
                <span className="text-[10px] sm:text-xs text-amber-400 font-mono font-bold bg-amber-950/60 px-1.5 sm:px-2 py-0.5 rounded border border-amber-800/60 shrink-0">
                  {songs.length > 1 ? `${currentIndex + 1}/${songs.length}` : 'En Vivo'}
                </span>
                <span className="text-[10px] sm:text-xs text-amber-300 font-mono font-extrabold bg-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                  {notation === 'solfa' ? NOTE_TO_SOLFA[effectiveKey] || effectiveKey : effectiveKey}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {currentSong?.artist_name} • {currentSong?.time_signature || '4/4'}
              </p>
            </div>
          </div>

          {/* Derecha: Acciones rápidas (visibles en desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Reloj y Cronómetro de Escenario */}
            <div className="relative">
              <button
                onClick={() => setIsTimerPopoverOpen(!isTimerPopoverOpen)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-bold transition ${
                  timerSeconds <= 60 && isTimerRunning
                    ? 'bg-red-500/25 text-red-300 border-red-500/50 animate-pulse'
                    : timerSeconds <= 300 && isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white'
                }`}
                title="Reloj de Escenario y Cuenta Regresiva de Alabanza"
              >
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>{currentTimeString || '--:--'}</span>
                <span className="text-slate-600">|</span>
                <Timer className="h-3.5 w-3.5 text-emerald-400" />
                <span className={timerSeconds <= 60 && isTimerRunning ? 'text-red-400 font-black' : 'text-emerald-400'}>
                  {formatTimer(timerSeconds)}
                </span>
              </button>

              {/* Popover desplegable del Cronómetro */}
              {isTimerPopoverOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Tiempo de Alabanza</span>
                    </div>
                    <button
                      onClick={() => setIsTimerPopoverOpen(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="py-4 text-center">
                    <span className={`text-4xl font-mono font-black tracking-tight ${
                      timerSeconds <= 60 && isTimerRunning
                        ? 'text-red-400 animate-pulse'
                        : timerSeconds <= 300 && isTimerRunning
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {formatTimer(timerSeconds)}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isTimerRunning ? 'Cuenta regresiva activa' : 'En pausa'}
                    </p>
                  </div>

                  {/* Controles del temporizador */}
                  <div className="flex items-center justify-center gap-2 pb-3">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        isTimerRunning
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      <span>{isTimerRunning ? 'Pausar' : 'Iniciar'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(timerInitialSeconds);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      title="Reiniciar"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Preajustes de tiempo */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80">
                    {[15, 20, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          setTimerInitialSeconds(mins * 60);
                          setTimerSeconds(mins * 60);
                        }}
                        className={`py-1 rounded-lg text-[11px] font-bold border transition ${
                          timerInitialSeconds === mins * 60
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metrónomo */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs">
              <button
                onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition ${
                  isMetronomeActive
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{songBpm} BPM</span>
              </button>

              <div
                className={`h-4 w-4 rounded-full transition-all duration-75 border ${
                  beatPulse
                    ? currentBeat === 1
                      ? 'bg-red-500 border-red-300 scale-125 shadow-lg shadow-red-500'
                      : 'bg-amber-400 border-amber-200 scale-110 shadow-md shadow-amber-400'
                    : 'bg-slate-800 border-slate-700'
                }`}
                title={`Pulso: ${currentBeat}`}
              />

              {isMetronomeActive && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {isAudioMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => setMetronomeMode(m => m === 'click' ? 'voice' : 'click')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                      metronomeMode === 'voice'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {metronomeMode === 'voice' ? 'Voz' : 'Click'}
                  </button>
                </div>
              )}
            </div>

            {/* Pad */}
            <button
              onClick={toggleAmbientPad}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                isPadPlaying
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Pad {concertKey}</span>
            </button>

            {/* Afinador */}
            <button
              onClick={() => setIsTunerOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 transition"
              title="Afinador Cromático Digital"
            >
              <Guitar className="h-3.5 w-3.5 text-amber-400" />
              <span>Afinador</span>
            </button>

            {/* Círculo Armónico */}
            <button
              onClick={() => setIsHarmonicCircleOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 text-xs font-semibold text-amber-300 transition"
            >
              <Compass className="h-3.5 w-3.5 text-amber-400" />
              <span>Círculo</span>
            </button>

            {/* Capo */}
            <button
              onClick={() => setIsCapoModalOpen(true)}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                activeCapoFret !== null
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Guitar className="h-3.5 w-3.5" />
              <span>{activeCapoFret !== null ? `Capo ${activeCapoFret}` : 'Capo'}</span>
            </button>

            {/* Proyección */}
            <button
              onClick={() => setIsProjectionOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 transition"
            >
              <Tv className="h-3.5 w-3.5 text-blue-400" />
              <span>Proyección</span>
            </button>

            {/* Instrumento */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-xs">
              <Sliders className="h-3 w-3 text-slate-400" />
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value as InstrumentKey)}
                className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
              >
                {INSTRUMENTS.map((inst) => (
                  <option key={inst.id} value={inst.id} className="bg-slate-950 text-white">
                    {inst.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Notación */}
            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setNotation('american')}
                className={`rounded px-2 py-1 transition ${
                  notation === 'american' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                C, D
              </button>
              <button
                onClick={() => setNotation('solfa')}
                className={`rounded px-2 py-1 transition ${
                  notation === 'solfa' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Do, Re
              </button>
            </div>

            {/* Transposición */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs">
              <span className="text-slate-400">Tono:</span>
              <span className="font-bold text-amber-400 min-w-5 text-center">
                {notation === 'solfa' ? NOTE_TO_SOLFA[effectiveKey] || effectiveKey : effectiveKey}
              </span>
              <button
                onClick={() => setSemitones(s => s - 1)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                onClick={() => setSemitones(s => s + 1)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
            </div>

            {/* Auto-scroll */}
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
                isAutoScrolling ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {isAutoScrolling ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isAutoScrolling ? 'Pausa' : 'Scroll'}</span>
            </button>
          </div>

          {/* Botones de acción rápida en móvil */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* Auto-scroll compacto */}
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                isAutoScrolling ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {isAutoScrolling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{isAutoScrolling ? 'Pausa' : 'Scroll'}</span>
            </button>

            {/* Afinador móvil */}
            <button
              onClick={() => setIsTunerOpen(true)}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-amber-400"
              title="Afinador"
            >
              <Guitar className="h-3.5 w-3.5" />
            </button>

            {/* Metrónomo compacto */}
            <button
              onClick={() => setIsMetronomeActive(!isMetronomeActive)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                isMetronomeActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 border border-slate-700 text-slate-300'
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>{songBpm}</span>
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all duration-75 ${
                  beatPulse ? (currentBeat === 1 ? 'bg-red-500' : 'bg-amber-400') : 'bg-slate-700'
                }`}
              />
            </button>

            {/* Pad compacto */}
            <button
              onClick={toggleAmbientPad}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                isPadPlaying ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-900 border border-slate-700 text-slate-300'
              }`}
            >
              <Radio className="h-3 w-3" />
              <span>Pad</span>
            </button>
          </div>
        </div>

        {/* Fila 2 en Móvil: Barra horizontal deslizable con herramientas de escenario */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto px-3 py-1.5 border-t border-slate-800/80 bg-slate-900/60 no-scrollbar text-xs">
          {/* Reloj y Cronómetro móvil */}
          <button
            onClick={() => setIsTimerPopoverOpen(!isTimerPopoverOpen)}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-mono text-emerald-400 shrink-0 font-bold"
          >
            <Timer className="h-3 w-3" />
            <span>{formatTimer(timerSeconds)}</span>
          </button>

          {/* Transposición */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 shrink-0">
            <span className="text-[10px] text-slate-400">Tono:</span>
            <button
              onClick={() => setSemitones(s => s - 1)}
              className="p-0.5 hover:bg-slate-800 text-slate-300 rounded"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <span className="font-extrabold text-amber-400 min-w-4 text-center text-xs">
              {notation === 'solfa' ? NOTE_TO_SOLFA[effectiveKey] || effectiveKey : effectiveKey}
            </span>
            <button
              onClick={() => setSemitones(s => s + 1)}
              className="p-0.5 hover:bg-slate-800 text-slate-300 rounded"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Círculo Armónico */}
          <button
            onClick={() => setIsHarmonicCircleOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-300 shrink-0"
          >
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span>Círculo</span>
          </button>

          {/* Capo */}
          <button
            onClick={() => setIsCapoModalOpen(true)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold shrink-0 transition ${
              activeCapoFret !== null
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <Guitar className="h-3.5 w-3.5" />
            <span>{activeCapoFret !== null ? `Capo ${activeCapoFret}` : 'Capo'}</span>
          </button>

          {/* Selector de Instrumento Transpositor */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg shrink-0">
            <Sliders className="h-3 w-3 text-slate-400" />
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(e.target.value as InstrumentKey)}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {INSTRUMENTS.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-slate-950 text-white">
                  {inst.description}
                </option>
              ))}
            </select>
          </div>

          {/* Switch Notación */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 shrink-0">
            <button
              onClick={() => setNotation('american')}
              className={`rounded px-1.5 py-0.5 text-[11px] transition ${
                notation === 'american' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              C, D
            </button>
            <button
              onClick={() => setNotation('solfa')}
              className={`rounded px-1.5 py-0.5 text-[11px] transition ${
                notation === 'solfa' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Do, Re
            </button>
          </div>

          {/* Proyección */}
          <button
            onClick={() => setIsProjectionOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-300 shrink-0"
          >
            <Tv className="h-3.5 w-3.5 text-blue-400" />
            <span>Proyección</span>
          </button>

          {/* Secuencias / Multitrack */}
          <button
            onClick={() => setIsMultitrackOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 text-xs font-bold text-blue-400 shrink-0"
            title="Reproductor de Multi-Pistas (Click & Cues)"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-400" />
            <span>Secuencias</span>
          </button>

          {/* Tablaturas y Riffs */}
          <button
            onClick={() => setIsGuitarTabOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400 shrink-0"
            title="Visualizador de Tablaturas y Riffs de Guitarra"
          >
            <Guitar className="h-3.5 w-3.5 text-emerald-400" />
            <span>Riffs</span>
          </button>

          {/* Modulación al siguiente tema */}
          {songs.length > 1 && (
            <button
              onClick={() => setIsTransitionOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-1 text-xs font-bold text-amber-300 shrink-0"
              title="Asistente de Transición y Modulación al siguiente tema"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Modulación</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BARRA DE DIRECCIÓN EN VIVO (DIRECTOR) vs BARRA DE ESTADO (MÚSICO)         */}
        {/* ========================================================================= */}
        {stageRole === 'director' ? (
          <div className="border-t border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/40 px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-xs font-black shrink-0 shadow-sm">
              <Crown className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Dirigir a:</span>
            </div>

            {/* Chips de Secciones de la Canción Actual */}
            {songSections.length > 0 ? (
              songSections.map((sec) => {
                const isCurrentActive = activeBroadcastSection &&
                  activeBroadcastSection.toLowerCase().replace(/[\[\]]/g, '').trim() === sec.toLowerCase().replace(/[\[\]]/g, '').trim();
                return (
                  <button
                    key={sec}
                    onClick={() => broadcastCue(sec, `¡Vamos a ${sec}!`, 'section')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 border ${
                      isCurrentActive
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30 ring-1 ring-amber-300'
                        : 'bg-slate-900/90 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 active:scale-95'
                    }`}
                    title={`Transmitir ${sec} a todos los músicos`}
                  >
                    <span>{sec}</span>
                  </button>
                );
              })
            ) : (
              <span className="text-[11px] text-slate-500 italic shrink-0">
                (Toca cualquier línea para guiar a los músicos)
              </span>
            )}

            <div className="h-4 w-px bg-slate-800 shrink-0 mx-0.5" />

            {/* Dinámicas de Alabanza en Vivo */}
            <button
              onClick={() => broadcastCue(activeBroadcastSection || 'Coro', '🔥 ¡AL CORO CON FUERZA!', 'dynamic')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shrink-0 active:scale-95"
            >
              🔥 Al Coro
            </button>
            <button
              onClick={() => broadcastCue(activeBroadcastSection, '🔁 ¡REPETIR ESTA SECCIÓN!', 'dynamic')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 shrink-0 active:scale-95"
            >
              🔁 Repetir
            </button>
            <button
              onClick={() => broadcastCue(null, '🎹 SUAVE / MINISTRACIÓN ÍNTIMA', 'dynamic')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 shrink-0 active:scale-95"
            >
              🎹 Suave
            </button>
            <button
              onClick={() => broadcastCue(null, '🥁 SOLO BATERÍA Y BAJO', 'dynamic')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shrink-0 active:scale-95"
            >
              🥁 Base Solo
            </button>
            <button
              onClick={() => broadcastCue(null, '🙌 A CAPELLA (CONGREGACIÓN)', 'dynamic')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 shrink-0 active:scale-95"
            >
              🙌 A Capella
            </button>
            <button
              onClick={() => broadcastCue(null, '🛑 CORTE / FINAL', 'dynamic')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 shrink-0 active:scale-95"
            >
              🛑 Corte
            </button>
          </div>
        ) : (
          <div className="border-t border-slate-800 bg-slate-950/80 px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                <Users className="h-3.5 w-3.5 text-amber-400" />
                <span>Modo Músico</span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Sincronizado con el Director
              </span>
              {syncConnected ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Wifi className="h-3 w-3" />
                  <span>En Línea</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  <WifiOff className="h-3 w-3" />
                  <span>Sin Red</span>
                </span>
              )}
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-white">
              <input
                type="checkbox"
                checked={autoFollowSong}
                onChange={(e) => setAutoFollowSong(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>Seguir al director</span>
            </label>
          </div>
        )}
      </header>

      {/* Rehearsal Notes Alert si existen */}
      {(currentSong?.performance_notes || currentSong?.notes) && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-xs flex items-center justify-between text-amber-300">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded">
              Instrucción para Músicos
            </span>
            <span>{currentSong.performance_notes || currentSong.notes}</span>
          </div>
          {currentSong.scripture_reference && (
            <span className="text-slate-400 text-[11px] hidden md:inline">
              📖 {currentSong.scripture_reference}
            </span>
          )}
        </div>
      )}

      {/* Contenido principal en tamaño grande para atril */}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-8 md:px-16 text-lg md:text-xl font-mono leading-relaxed space-y-4"
      >
        {/* Banner Flotante HUD de Señal del Director en Vivo */}
        {activeDirectorCue && (
          <div className="sticky top-2 z-40 mx-auto max-w-2xl my-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-0.5 shadow-2xl shadow-amber-500/30 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between rounded-[14px] bg-slate-950/95 px-4 py-2.5 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/50 shrink-0">
                  <Crown className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Señal del Director
                    </span>
                    <span className="text-[10px] text-slate-400">En vivo</span>
                  </div>
                  <p className="text-base sm:text-xl font-black text-white tracking-wide truncate">
                    {activeDirectorCue.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDirectorCue(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {viewMode === 'sheet' && currentSong?.sheet_music_url ? (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            {currentSong.sheet_music_url.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={currentSong.sheet_music_url}
                className="w-full h-[80vh] rounded-xl border border-slate-800"
                title="Partitura"
              />
            ) : (
              <img
                src={currentSong.sheet_music_url}
                alt="Partitura"
                className="max-h-[85vh] object-contain rounded-xl"
              />
            )}
          </div>
        ) : (
          parsedContent.map((line, idx) => {
            if (line.type === 'empty') return <div key={idx} className="h-6" />;

            if (line.type === 'section') {
              const clean = (line.sectionName || '').replace(/[\[\]]/g, '').trim().toLowerCase().replace(/\s+/g, '-');
              const isSectionActive = activeBroadcastSection && (
                activeBroadcastSection.toLowerCase().replace(/[\[\]]/g, '').trim() === (line.sectionName || '').toLowerCase().replace(/[\[\]]/g, '').trim()
              );
              return (
                <div
                  key={idx}
                  data-section-id={clean}
                  className={`pt-4 pb-2 transition-all duration-300 rounded-xl px-2.5 ${
                    isSectionActive
                      ? 'bg-amber-500/20 ring-2 ring-amber-400 shadow-xl shadow-amber-500/20 animate-pulse'
                      : ''
                  }`}
                >
                  <button
                    onClick={() => {
                      if (stageRole === 'director') {
                        broadcastCue(line.sectionName, `¡Vamos a ${line.sectionName}!`, 'section');
                      }
                    }}
                    className={`group flex items-center gap-2 rounded-lg border px-4 py-1.5 text-base md:text-lg font-extrabold tracking-wider transition ${
                      isSectionActive
                        ? 'border-amber-300 bg-amber-400 text-slate-950 shadow-md'
                        : 'border-amber-400/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    } ${stageRole === 'director' ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                    title={stageRole === 'director' ? `Tocar para transmitir ${line.sectionName} a los demás músicos` : line.sectionName}
                  >
                    {stageRole === 'director' && (
                      <Crown className={`h-4 w-4 ${isSectionActive ? 'text-slate-950' : 'text-amber-400 group-hover:scale-110 transition'}`} />
                    )}
                    <span>{line.sectionName}</span>
                    {stageRole === 'director' && (
                      <span className={`text-[10px] uppercase font-bold tracking-normal px-1.5 py-0.5 rounded ml-1 transition ${
                        isSectionActive ? 'bg-black/30 text-white' : 'bg-amber-500/30 text-amber-200 group-hover:bg-amber-500/50'
                      }`}>
                        {isSectionActive ? 'En Pantalla' : 'Transmitir'}
                      </span>
                    )}
                  </button>
                </div>
              );
            }

            if (line.type === 'lyrics-only') {
              return (
                <div key={idx} className="text-slate-100 font-sans whitespace-pre-wrap pl-1 font-medium">
                  {line.rawText}
                </div>
              );
            }

            if (line.type === 'chords-and-lyrics' && line.items) {
              return (
                <div key={idx} className="flex flex-wrap items-end gap-x-1.5 gap-y-3 pl-1 py-1">
                  {line.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="inline-flex flex-col">
                      {item.chord ? (
                        <button
                          onClick={() => setSelectedChord(item.chord || null)}
                          className="text-left font-black text-amber-400 hover:text-amber-200 transition-colors -mb-1 text-base md:text-xl font-mono cursor-pointer"
                        >
                          {item.chord}
                        </button>
                      ) : (
                        <span className="h-6" />
                      )}
                      <span className="text-white font-sans text-lg md:text-xl font-medium whitespace-pre">
                        {item.lyric || ' '}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }

            return null;
          })
        )}
      </main>

      {/* Barra de pie con botones de cambio de canción de tamaño táctil amplio */}
      {songs.length > 1 && (
        <footer className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-3 py-2 sm:px-6 sm:py-3">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-slate-200 transition shadow shrink-0"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Canción Anterior</span>
            <span className="sm:hidden">Ant.</span>
          </button>

          <div className="text-center px-1 min-w-0">
            <span className="text-[10px] sm:text-xs text-slate-400 block">Próxima:</span>
            <p className="text-xs sm:text-sm font-bold text-amber-400 truncate max-w-[120px] sm:max-w-xs">
              {currentIndex + 1 < songs.length ? songs[currentIndex + 1].title : 'Fin del Setlist'}
            </p>
          </div>

          <button
            onClick={() => setCurrentIndex(i => Math.min(songs.length - 1, i + 1))}
            disabled={currentIndex === songs.length - 1}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-black text-slate-950 transition shadow-lg shadow-amber-500/20 shrink-0"
          >
            <span className="hidden sm:inline">Siguiente Canción</span>
            <span className="sm:hidden">Sig.</span>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </footer>
      )}

      {/* Grabadora flotante de ensayos */}
      <RehearsalAudioRecorderBar currentSongTitle={currentSong?.title} />

      {/* Modal de Diagramas */}
      <ChordDiagramModal
        chord={selectedChord}
        onClose={() => setSelectedChord(null)}
      />

      {/* Modal Calculadora de Cejilla / Capo */}
      <CapoCalculatorModal
        isOpen={isCapoModalOpen}
        concertKey={concertKey}
        onClose={() => setIsCapoModalOpen(false)}
        onApplyCapo={handleApplyCapo}
      />

      {/* Modo Proyección Congregacional (Segunda Pantalla / Beamer) */}
      <ProjectionModal
        isOpen={isProjectionOpen}
        songs={songs}
        initialSongIndex={currentIndex}
        onClose={() => setIsProjectionOpen(false)}
      />

      {/* Modal Círculo Armónico & Acompañamiento Espontáneo */}
      <HarmonicCircleModal
        isOpen={isHarmonicCircleOpen}
        onClose={() => setIsHarmonicCircleOpen(false)}
        initialKey={concertKey}
      />

      {/* Afinador Cromático Digital para Escenario */}
      <InstrumentTunerModal
        isOpen={isTunerOpen}
        onClose={() => setIsTunerOpen(false)}
      />

      {/* Visualizador de Tablaturas y Riffs Icónicos en Escenario */}
      <GuitarTabViewer
        isOpen={isGuitarTabOpen}
        onClose={() => setIsGuitarTabOpen(false)}
        songTitle={currentSong?.title}
      />

      {/* Reproductor Multi-Pistas (Click & Cues) en Escenario */}
      <MultitrackPlayerModal
        isOpen={isMultitrackOpen}
        onClose={() => setIsMultitrackOpen(false)}
        songTitle={currentSong?.title}
        initialKey={concertKey}
        initialBpm={currentSong?.tempo || 72}
      />

      {/* Asistente de Transición al siguiente tema en Escenario */}
      <SongTransitionModal
        isOpen={isTransitionOpen}
        onClose={() => setIsTransitionOpen(false)}
        songs={songs}
        initialSourceSong={currentSong}
        initialTargetSong={songs[currentIndex + 1]}
      />

      {/* Modal de Sincronización P2P para Ensayos y Dirección */}
      <RehearsalSyncModal
        isOpen={isRehearsalModalOpen}
        onClose={() => setIsRehearsalModalOpen(false)}
        onRoleChanged={(newRole) => setStageRole(newRole === 'director' ? 'director' : 'musician')}
        currentSetlist={songs}
        currentSongTitle={currentSong?.title}
      />

      {/* Botón flotante accesible de regreso rápido en móvil */}
      <button
        onClick={handleExit}
        className="md:hidden fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-amber-400 border border-slate-700/80 px-3.5 py-2 text-xs font-bold shadow-2xl backdrop-blur-md active:scale-90 transition-transform"
        title="Volver al cancionero"
      >
        <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
        <span className="text-white">Volver</span>
      </button>
    </div>
  );
}
