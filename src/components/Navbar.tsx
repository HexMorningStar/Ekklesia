'use client';

import React from 'react';
import { 
  Music, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Settings, 
  Church,
  Sun,
  Moon,
  Compass,
  Smartphone,
  Guitar,
  BarChart3,
  Sliders,
  ArrowRightLeft,
  Users,
  Radio
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export type ActiveTab = 'songs' | 'setlists' | 'bible';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenGeminiSearch: () => void;
  onOpenCreateSong: () => void;
  onOpenSettings: () => void;
  onOpenHarmonicCircle: () => void;
  onOpenAndroidSync: () => void;
  onOpenRehearsalSync?: () => void;
  onOpenTuner?: () => void;
  onOpenRecommendations?: () => void;
  onOpenAnalytics?: () => void;
  onOpenPdfExport?: () => void;
  onOpenMultitrack?: () => void;
  onOpenSongTransition?: () => void;
  onOpenGuitarTab?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenGeminiSearch,
  onOpenCreateSong,
  onOpenSettings,
  onOpenHarmonicCircle,
  onOpenAndroidSync,
  onOpenRehearsalSync,
  onOpenTuner,
  onOpenRecommendations,
  onOpenAnalytics,
  onOpenPdfExport,
  onOpenMultitrack,
  onOpenSongTransition,
  onOpenGuitarTab
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 pt-[max(0.65rem,env(safe-area-inset-top))] transition-colors shadow-sm dark:shadow-none">
      {/* ========================================================================= */}
      {/* VISTA MÓVIL (< 768px - Galaxy S25 Ultra y Smartphones)                   */}
      {/* ========================================================================= */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-sm shrink-0">
            <Church className="h-4 w-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight truncate block">
              Ekklesia <span className="text-amber-500 dark:text-amber-400">Music</span>
            </span>
          </div>
        </div>

        {/* Acciones Rápidas Móvil */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenGeminiSearch}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm transition active:scale-95"
            title="Buscar con Gemini IA"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>IA</span>
          </button>

          <button
            onClick={onOpenCreateSong}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1.5 text-slate-700 dark:text-slate-300 transition active:scale-95"
            title="Nueva Canción"
          >
            <Plus className="h-4 w-4 text-amber-500" />
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1.5 text-slate-600 dark:text-slate-300 transition active:scale-95"
            title={theme === 'dark' ? 'Tema Claro' : 'Tema Oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          <button
            onClick={onOpenAndroidSync}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400 transition active:scale-95"
            title="EKKLESIA para Android (APK)"
          >
            <Smartphone className="h-4 w-4" />
          </button>

          {onOpenRehearsalSync && (
            <button
              onClick={onOpenRehearsalSync}
              className="rounded-lg border border-amber-500/40 bg-amber-500/15 p-1.5 text-amber-500 transition active:scale-95"
              title="Modo Ensayo P2P (Banda y Director)"
            >
              <Radio className="h-4 w-4 text-amber-500" />
            </button>
          )}

          {onOpenTuner && (
            <button
              onClick={onOpenTuner}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1.5 text-amber-500 transition active:scale-95"
              title="Afinador de Instrumentos"
            >
              <Guitar className="h-4 w-4" />
            </button>
          )}

          {onOpenRecommendations && (
            <button
              onClick={onOpenRecommendations}
              className="rounded-lg border border-amber-500/40 bg-amber-500/15 p-1.5 text-amber-500 transition active:scale-95"
              title="10 Recomendaciones y Novedades"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1.5 text-slate-500 dark:text-slate-400 transition active:scale-95"
            title="Configuración"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA ESCRITORIO (>= 768px Tablets y Desktop)                            */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-wrap items-center justify-between gap-4">
        {/* Logo / Nombre del Gestor */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-md shadow-amber-500/20">
            <Church className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                Ekklesia <span className="text-amber-500 dark:text-amber-400">Music</span>
              </span>
              <span className="rounded-md bg-amber-500/15 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Alabanza & Iglesia
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Acordes, Solfa, Setlists de Ensayo y Biblia RVR 1960
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación Principal */}
        <nav className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('songs')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
              activeTab === 'songs'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Music className="h-4 w-4" />
            <span>Canciones y Acordes</span>
          </button>

          <button
            onClick={() => setActiveTab('setlists')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
              activeTab === 'setlists'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Gestor de Ensayos</span>
          </button>

          <button
            onClick={() => setActiveTab('bible')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
              activeTab === 'bible'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Biblia RVR 1960</span>
          </button>
        </nav>

        {/* Botones de acción rápida en escritorio */}
        <div className="flex items-center gap-2">
          {/* Selector de Tema Iluminado / Oscuro */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            title={theme === 'dark' ? 'Cambiar a Tema Iluminado (Claro)' : 'Cambiar a Tema Oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Círculo Armónico */}
          <button
            onClick={onOpenHarmonicCircle}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 transition"
            title="Círculo Armónico: Acompañar al instante sin nota base"
          >
            <Compass className="h-4 w-4 text-amber-500" />
            <span className="hidden lg:inline">Círculo Armónico</span>
            <span className="lg:hidden">Círculo</span>
          </button>

          {/* Afinador Cromático */}
          {onOpenTuner && (
            <button
              onClick={onOpenTuner}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
              title="Afinador Cromático Digital para Guitarra, Bajo y Ukelele"
            >
              <Guitar className="h-4 w-4 text-amber-500" />
              <span className="hidden lg:inline">Afinador</span>
            </button>
          )}

          {/* Novedades y Recomendaciones (10/10) */}
          {onOpenRecommendations && (
            <button
              onClick={onOpenRecommendations}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-600/30 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 transition shadow-sm active:scale-95"
              title="Ver el centro de 10 recomendaciones y funciones implementadas"
            >
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Novedades (10)</span>
            </button>
          )}

          {/* Secuencias / Multitrack Player */}
          {onOpenMultitrack && (
            <button
              onClick={onOpenMultitrack}
              className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-400 transition"
              title="Reproductor de Multi-Pistas, Clic y Secuencias"
            >
              <Sliders className="h-4 w-4 text-blue-500" />
              <span className="hidden xl:inline">Secuencias</span>
            </button>
          )}

          {/* Transiciones y Modulaciones */}
          {onOpenSongTransition && (
            <button
              onClick={onOpenSongTransition}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
              title="Generador de Transiciones y Modulaciones Asistido"
            >
              <ArrowRightLeft className="h-4 w-4 text-amber-500" />
              <span className="hidden xl:inline">Transición</span>
            </button>
          )}

          {/* Tablaturas y Riffs */}
          {onOpenGuitarTab && (
            <button
              onClick={onOpenGuitarTab}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition"
              title="Visualizador de Tablaturas y Riffs Icónicos"
            >
              <Guitar className="h-4 w-4 text-emerald-500" />
              <span className="hidden xl:inline">Riffs / Tab</span>
            </button>
          )}

          {/* Analítica y Rotación */}
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 text-purple-600 dark:text-purple-400 transition"
              title="Analítica y Rotación de Alabanzas"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          )}

          {/* Sincronización P2P Banda y Director */}
          {onOpenRehearsalSync && (
            <button
              onClick={onOpenRehearsalSync}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 transition shadow-sm active:scale-95"
              title="Sincronización P2P de Ensayo entre Músicos y Director"
            >
              <Radio className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="hidden lg:inline">Ensayo P2P</span>
              <span className="lg:hidden">P2P</span>
            </button>
          )}

          {/* Botón EKKLESIA para Android (APK) */}
          <button
            onClick={onOpenAndroidSync}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition shadow-sm"
            title="Conectar tablets y celulares en el atril y descargar EKKLESIA.apk"
          >
            <Smartphone className="h-4 w-4 text-emerald-500" />
            <span className="hidden lg:inline">App Android</span>
            <span className="lg:hidden">APK</span>
          </button>

          <button
            onClick={onOpenGeminiSearch}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition shadow-md shadow-amber-500/20"
            title="Buscar con Gemini IA"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Buscar con</span>
            <span>Gemini IA</span>
          </button>

          <button
            onClick={onOpenCreateSong}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            title="Crear o pegar canción manualmente"
          >
            <Plus className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">Nueva Canción</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            title="Configuración de API y sistema"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
