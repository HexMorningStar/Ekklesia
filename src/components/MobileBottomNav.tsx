'use client';

import React from 'react';
import { 
  Music, 
  Calendar, 
  BookOpen, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenHarmonicCircle: () => void;
  onOpenGeminiSearch: () => void;
}

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenHarmonicCircle,
  onOpenGeminiSearch
}: MobileBottomNavProps) {
  return (
    <nav 
      aria-label="Navegación Móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-2 py-1.5 transition-colors shadow-2xl pb-[max(env(safe-area-inset-bottom),0.4rem)]"
    >
      <div className="grid grid-cols-5 items-center justify-around gap-1 max-w-md mx-auto">
        {/* Tab 1: Canciones */}
        <button
          onClick={() => setActiveTab('songs')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            activeTab === 'songs'
              ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'songs' ? 'bg-amber-500/15 dark:bg-amber-500/20' : ''}`}>
            <Music className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">Canciones</span>
        </button>

        {/* Tab 2: Ensayos */}
        <button
          onClick={() => setActiveTab('setlists')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            activeTab === 'setlists'
              ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'setlists' ? 'bg-amber-500/15 dark:bg-amber-500/20' : ''}`}>
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">Ensayos</span>
        </button>

        {/* Tab 3: Biblia */}
        <button
          onClick={() => setActiveTab('bible')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
            activeTab === 'bible'
              ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'bible' ? 'bg-amber-500/15 dark:bg-amber-500/20' : ''}`}>
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">Biblia RVR</span>
        </button>

        {/* Tab 4: Círculo Armónico */}
        <button
          onClick={onOpenHarmonicCircle}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
          title="Círculo armónico para acompañamiento"
        >
          <div className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Compass className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">Círculo</span>
        </button>

        {/* Tab 5: Gemini IA */}
        <button
          onClick={onOpenGeminiSearch}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-amber-600 dark:text-amber-400 transition group"
          title="Buscar canciones con Gemini 3.8 y LaCuerda"
        >
          <div className="p-1 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/30 group-hover:scale-105 transition">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-amber-600 dark:text-amber-400">Gemini IA</span>
        </button>
      </div>
    </nav>
  );
}
