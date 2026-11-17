'use client';

import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Wifi, 
  Crown, 
  Guitar, 
  Clock, 
  BarChart3, 
  Printer, 
  Compass, 
  Radio, 
  Tv, 
  Mic, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sliders,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

interface MinistryRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveStage: () => void;
  onOpenTuner: () => void;
  onOpenHarmonicCircle: () => void;
  onOpenAnalytics: () => void;
  onOpenPdfExport: () => void;
  onOpenProjection: () => void;
  onOpenMultitrack?: () => void;
  onOpenSongTransition?: () => void;
  onOpenGuitarTab?: () => void;
}

export default function MinistryRecommendationsModal({
  isOpen,
  onClose,
  onOpenLiveStage,
  onOpenTuner,
  onOpenHarmonicCircle,
  onOpenAnalytics,
  onOpenPdfExport,
  onOpenProjection,
  onOpenMultitrack,
  onOpenSongTransition,
  onOpenGuitarTab
}: MinistryRecommendationsModalProps) {
  if (!isOpen) return null;

  const features = [
    {
      id: 1,
      title: '1. Modo Fuera de Línea (PWA & Service Worker)',
      desc: 'Caché Stale-While-Revalidate en sw.js para que el cancionero, tonalidades, setlists y la Biblia RVR 1960 funcionen 100% en sótanos o templos sin señal.',
      status: 'Activo',
      icon: Wifi,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      actionLabel: 'Activo en segundo plano',
      onAction: null
    },
    {
      id: 2,
      title: '2. Sincronización en Vivo entre Músicos (Live Sync / Master-Slave)',
      desc: 'El director es "Master" y selecciona secciones ([Coro], [Puente]) o dinámicas (🔥 Al Coro, 🔁 Repetir, 🎹 Suave, 🛑 Corte) transmitiéndose en tiempo real a todas las pantallas.',
      status: 'Activo',
      icon: Crown,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      actionLabel: 'Abrir Atril en Vivo',
      onAction: () => {
        onClose();
        onOpenLiveStage();
      }
    },
    {
      id: 3,
      title: '3. Afinador Cromático Digital Integrado con Micrófono',
      desc: 'Detección de tono por autocorrelación de micrófono con Web Audio API, medidor de cents y presets para guitarra, bajo y ukelele a 440 Hz.',
      status: 'Activo',
      icon: Guitar,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      actionLabel: 'Abrir Afinador',
      onAction: () => {
        onClose();
        onOpenTuner();
      }
    },
    {
      id: 4,
      title: '4. Reproductor de Multi-Pistas (Multitrack Player / Click & Cues)',
      desc: 'Mezclador de 5 stems (Pads, Clic, Guía de voz "1,2,3,4", Batería y Bajo) con faders, botones Mute/Solo y ruteo In-Ear Split (L: Clic/Voz, R: Música al templo).',
      status: 'Activo',
      icon: Sliders,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      actionLabel: 'Abrir Mezclador',
      onAction: () => {
        onClose();
        onOpenMultitrack?.();
      }
    },
    {
      id: 5,
      title: '5. Historial y Métricas de Rotación de Canciones',
      desc: 'Monitoreo de frecuencia de uso, gráfico de tonalidades dominantes en la congregación y detección de canciones olvidadas (>60 días sin tocarse).',
      status: 'Activo',
      icon: BarChart3,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
      actionLabel: 'Ver Métricas',
      onAction: () => {
        onClose();
        onOpenAnalytics();
      }
    },
    {
      id: 6,
      title: '6. Soporte para Controladores MIDI por Bluetooth y USB',
      desc: 'Compatibilidad nativa con Web MIDI API y pedales Bluetooth (AirTurn, PageFlip, Donner, pedaleras MIDI) para scroll, cambio de canción y activación de pads.',
      status: 'Activo',
      icon: Radio,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
      actionLabel: 'Ver en Atril',
      onAction: () => {
        onClose();
        onOpenLiveStage();
      }
    },
    {
      id: 7,
      title: '7. Generador de Transiciones y Modulaciones Asistido',
      desc: 'Calcula acordes pivote, dominantes secundarias V7 y cadencias II-V-I entre canciones consecutivas del setlist, con consejos para teclado, guitarra, batería y bajo.',
      status: 'Activo',
      icon: ArrowRightLeft,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      actionLabel: 'Abrir Transiciones',
      onAction: () => {
        onClose();
        onOpenSongTransition?.();
      }
    },
    {
      id: 8,
      title: '8. Exportador de Cancionero Ministerial a PDF Formateado',
      desc: 'Hojas de acordes profesionales a 2 columnas con tamaños de fuente ajustables, diseñadas para carpetas físicas de ensayo sin pasar páginas a mitad de una canción.',
      status: 'Activo',
      icon: Printer,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/30',
      actionLabel: 'Exportar PDF',
      onAction: () => {
        onClose();
        onOpenPdfExport();
      }
    },
    {
      id: 9,
      title: '9. Visualizador de Tablaturas y Riffs Icónicos',
      desc: 'Tablaturas interactivas de 6 cuerdas con reproducción de audio sintetizado en tiempo real y biblioteca de intros icónicas (La Bondad de Dios, Hermoso Nombre, Alaba, etc.).',
      status: 'Activo',
      icon: Guitar,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      actionLabel: 'Abrir Tablaturas',
      onAction: () => {
        onClose();
        onOpenGuitarTab?.();
      }
    },
    {
      id: 10,
      title: '10. Reloj de Escenario & Cronómetro de Ministración',
      desc: 'Reloj en tiempo real HH:MM:SS y cuenta regresiva de culto (15, 20, 30, 45 min) con alertas de color verde, amarillo y rojo para el director en vivo.',
      status: 'Activo',
      icon: Clock,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
      actionLabel: 'Ver en Atril',
      onAction: () => {
        onClose();
        onOpenLiveStage();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Centro de Novedades y Recomendaciones
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  10 / 10 Activas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ekklesia Music: Plataforma definitiva para directores de alabanza y bandas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de Recomendaciones */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-amber-500/30 transition group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${feat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {feat.title}
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        {feat.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                {feat.onAction ? (
                  <button
                    onClick={feat.onAction}
                    className="self-end sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition active:scale-95 shadow-sm"
                  >
                    <span>{feat.actionLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="self-end sm:self-center shrink-0 text-[11px] font-medium text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    {feat.actionLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-semibold">Todas las funciones operativas en local y APK</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-950 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
