'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Link2, 
  ArrowLeft, 
  Bookmark, 
  Sparkles, 
  Music,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Circle,
  Calendar,
  Monitor,
  Share2,
  Palette,
  Highlighter,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Filter,
  Layers,
  Clock,
  Flame,
  Volume2
} from 'lucide-react';
import { BIBLE_BOOKS, BibleBook, findBookByName, parseBibleCitation } from '@/lib/bible-data';
import { BIBLE_READING_PLANS, ReadingPlan, ReadingPlanDay } from '@/lib/bible-plans';
import { LITURGICAL_MOMENTS, HEBREW_WORSHIP_TERMS, LiturgicalMoment, HebrewWorshipTerm } from '@/lib/bible-terms';

interface BibleReaderProps {
  onSelectPassageForSong?: (reference: string) => void;
}

export default function BibleReader({ onSelectPassageForSong }: BibleReaderProps) {
  // Pestaña activa principal
  const [activeMainTab, setActiveMainTab] = useState<'reader' | 'plans' | 'liturgical' | 'terms'>('reader');

  // Lector Bíblico
  const [selectedTestament, setSelectedTestament] = useState<'all' | 'Antiguo Testamento' | 'Nuevo Testamento'>('all');
  const [selectedBook, setSelectedBook] = useState<BibleBook>(BIBLE_BOOKS[18]); // Default Salmos (id 19)
  const [selectedChapter, setSelectedChapter] = useState<number>(23); // Default Salmo 23
  const [chapterData, setChapterData] = useState<{ verses: any[]; crossRefs: any[]; connectedSongs?: any[] }>({ 
    verses: [], 
    crossRefs: [],
    connectedSongs: []
  });
  const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(false);
  const [isMobileBookSelectorOpen, setIsMobileBookSelectorOpen] = useState<boolean>(false);

  // Búsqueda
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchExecuted, setSearchExecuted] = useState<boolean>(false);

  // Referencias Cruzadas del versículo activo
  const [activeVerseForCrossRef, setActiveVerseForCrossRef] = useState<any | null>(null);
  const [verseCrossRefs, setVerseCrossRefs] = useState<any[]>([]);
  const [loadingCrossRefs, setLoadingCrossRefs] = useState<boolean>(false);

  // Resaltado de versículos
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  const [highlightMenuVerse, setHighlightMenuVerse] = useState<any | null>(null);

  // Proyección de Versículos (Pantalla de Púlpito / Proyector)
  const [projectedVerse, setProjectedVerse] = useState<any | null>(null);
  const [projectionFontSize, setProjectionFontSize] = useState<number>(42);
  const [isProjectionFullscreen, setIsProjectionFullscreen] = useState<boolean>(false);

  // Tarjeta Visual de Versículos para Redes / WhatsApp
  const [visualCardVerse, setVisualCardVerse] = useState<any | null>(null);
  const [cardCopied, setCardCopied] = useState<boolean>(false);

  // Planes de Lectura
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-musicos-90');
  const [planCompletedDays, setPlanCompletedDays] = useState<Record<string, number[]>>({});
  const [planFilter, setPlanFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Cargar estado guardado de planes y resaltados desde localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('bible_reading_progress');
      if (savedProgress) {
        setPlanCompletedDays(JSON.parse(savedProgress));
      }
      const savedHighlights = localStorage.getItem('bible_verse_highlights');
      if (savedHighlights) {
        setHighlights(JSON.parse(savedHighlights));
      }
    } catch (e) {
      console.error('Error cargando estado local de biblia:', e);
    }
  }, []);

  // Cargar capítulo cuando cambie de libro o capítulo
  useEffect(() => {
    async function loadChapter() {
      setIsLoadingChapter(true);
      try {
        const res = await fetch(`/api/bible?type=chapter&book=${encodeURIComponent(selectedBook.name)}&chapter=${selectedChapter}`);
        const data = await res.json();
        if (data.success) {
          setChapterData({
            verses: data.verses || [],
            crossRefs: data.crossRefs || [],
            connectedSongs: data.connectedSongs || []
          });
        }
      } catch (e) {
        console.error('Error cargando capítulo:', e);
      } finally {
        setIsLoadingChapter(false);
      }
    }

    loadChapter();
  }, [selectedBook, selectedChapter]);

  // Manejo de búsqueda
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchExecuted(true);
    try {
      const res = await fetch(`/api/bible?type=search&q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error('Error buscando en la biblia:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Cargar referencias cruzadas de un versículo
  const handleInspectCrossRef = async (verse: any) => {
    setActiveVerseForCrossRef(verse);
    setLoadingCrossRefs(true);
    try {
      const res = await fetch(
        `/api/bible?type=cross_ref&book=${encodeURIComponent(verse.book)}&chapter=${verse.chapter}&verse=${verse.verse}`
      );
      const data = await res.json();
      if (data.success) {
        setVerseCrossRefs(data.crossReferences || []);
      }
    } catch (e) {
      console.error('Error al cargar referencias cruzadas:', e);
    } finally {
      setLoadingCrossRefs(false);
    }
  };

  // Navegar a un pasaje específico desde cualquier parte (Plan, Guía Litúrgica o Búsqueda)
  const navigateToPassage = (bookName: string, chapter: number) => {
    const foundBook = findBookByName(bookName);
    if (foundBook) {
      setSelectedBook(foundBook);
      setSelectedChapter(chapter);
      setActiveMainTab('reader');
      setSearchExecuted(false);
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Alternar resaltado de color en un versículo
  const toggleHighlight = (verse: any, color: 'yellow' | 'green' | 'blue' | 'red' | null) => {
    const key = `${verse.book}-${verse.chapter}-${verse.verse}`;
    const updated = { ...highlights };
    if (!color) {
      delete updated[key];
    } else {
      updated[key] = color;
    }
    setHighlights(updated);
    localStorage.setItem('bible_verse_highlights', JSON.stringify(updated));
    setHighlightMenuVerse(null);
  };

  // Marcar/Desmarcar día en el plan de lectura
  const toggleDayCompletion = (planId: string, dayNumber: number) => {
    const currentCompleted = planCompletedDays[planId] || [];
    let updatedDays: number[];
    if (currentCompleted.includes(dayNumber)) {
      updatedDays = currentCompleted.filter(d => d !== dayNumber);
    } else {
      updatedDays = [...currentCompleted, dayNumber].sort((a, b) => a - b);
    }

    const updatedMap = {
      ...planCompletedDays,
      [planId]: updatedDays
    };
    setPlanCompletedDays(updatedMap);
    localStorage.setItem('bible_reading_progress', JSON.stringify(updatedMap));
  };

  // Copiar tarjeta visual formateada para WhatsApp
  const handleCopyCardText = (verse: any) => {
    if (!verse) return;
    const text = `📖 *${verse.book} ${verse.chapter}:${verse.verse} (RVR1960)*\n«${verse.text}»\n\n🕊️ _Ministerio de Alabanza • Ekklesia Music_`;
    navigator.clipboard.writeText(text);
    setCardCopied(true);
    setTimeout(() => setCardCopied(false), 2000);
  };

  const filteredBooks = selectedTestament === 'all'
    ? BIBLE_BOOKS
    : BIBLE_BOOKS.filter(b => b.testament === selectedTestament);

  const activePlan = BIBLE_READING_PLANS.find(p => p.id === selectedPlanId) || BIBLE_READING_PLANS[0];
  const planDays = activePlan.generateDays();
  const completedForActivePlan = planCompletedDays[activePlan.id] || [];
  const percentCompleted = Math.round((completedForActivePlan.length / activePlan.totalDays) * 100);

  return (
    <div className="flex flex-col h-full gap-4 text-slate-800 dark:text-slate-100">
      {/* Barra de Pestañas Superiores del Módulo Bíblico */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap">
          <button
            onClick={() => setActiveMainTab('reader')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeMainTab === 'reader'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Lector RVR1960</span>
          </button>

          <button
            onClick={() => setActiveMainTab('plans')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeMainTab === 'plans'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Planes de Lectura</span>
            {completedForActivePlan.length > 0 && (
              <span className="rounded-full bg-slate-900/20 dark:bg-white/20 px-1.5 py-0.2 text-[10px]">
                {percentCompleted}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMainTab('liturgical')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeMainTab === 'liturgical'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Momentos del Culto</span>
          </button>

          <button
            onClick={() => setActiveMainTab('terms')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
              activeMainTab === 'terms'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            <span>Léxico Hebreo</span>
          </button>
        </div>

        {/* Cita rápida / Versión */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="font-semibold text-amber-600 dark:text-amber-400">Reina Valera 1960</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: LECTOR BÍBLICO (RVR1960) CON PROYECCIÓN Y CANCIONES CONECTADAS */}
      {/* ========================================================================= */}
      {activeMainTab === 'reader' && (
        <div className="flex flex-col lg:flex-row h-full gap-3 sm:gap-4">
          {/* Panel Izquierdo: Selector de Libros y Capítulos (Desktop >= 1024px) */}
          <div className="hidden lg:flex w-80 flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-xl overflow-hidden shrink-0 transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">Los 66 Libros</h2>
              </div>

              {/* Filtro Testamento */}
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 dark:bg-slate-950 p-1 text-xs">
                <button
                  onClick={() => setSelectedTestament('all')}
                  className={`rounded py-1 font-medium transition ${
                    selectedTestament === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedTestament('Antiguo Testamento')}
                  className={`rounded py-1 font-medium transition ${
                    selectedTestament === 'Antiguo Testamento'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Antiguo
                </button>
                <button
                  onClick={() => setSelectedTestament('Nuevo Testamento')}
                  className={`rounded py-1 font-medium transition ${
                    selectedTestament === 'Nuevo Testamento'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Nuevo
                </button>
              </div>
            </div>

            {/* Lista de Libros */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[500px]">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                      setSearchExecuted(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-left text-xs transition ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border-l-4 border-amber-500'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <span className="text-sm">{book.name}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {book.genre} • {book.chaptersCount} cap.
                      </span>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 ${isSelected ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel Central y Derecho: Lector de Versículos */}
          <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-xl overflow-hidden transition-colors">
            {/* Cabecera del Lector con Selector de Capítulo y Búsqueda */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 p-3 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedBook.name}</span>
                      <span className="text-amber-600 dark:text-amber-400">Capítulo {selectedChapter}</span>
                    </h1>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedBook.testament} • {selectedBook.genre}
                    </p>
                  </div>

                  {/* Botón selector de libro en móvil */}
                  <button
                    onClick={() => setIsMobileBookSelectorOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm active:scale-95"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Cambiar libro</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Formulario de Búsqueda rápida */}
                <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar versículo o cita (ej: Sal 23:1)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-xs transition shrink-0"
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </button>
                </form>
              </div>

              {/* Selector horizontal de capítulos */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Capítulos:
                </span>
                {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => {
                  const isCurrent = ch === selectedChapter;
                  return (
                    <button
                      key={ch}
                      onClick={() => {
                        setSelectedChapter(ch);
                        setSearchExecuted(false);
                      }}
                      className={`h-7 w-7 rounded-md text-xs font-semibold shrink-0 transition ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>

              {/* Banner de Canciones del Repertorio Conectadas */}
              {chapterData.connectedSongs && chapterData.connectedSongs.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
                    <Music className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>
                      <strong>{chapterData.connectedSongs.length} canción(es)</strong> en tu repertorio inspiradas en este pasaje:
                    </span>
                    <span className="italic">
                      {chapterData.connectedSongs.map(s => `"${s.title}" (${s.artist_name})`).join(', ')}
                    </span>
                  </div>
                  {onSelectPassageForSong && (
                    <button
                      onClick={() => onSelectPassageForSong(`${selectedBook.name} ${selectedChapter}`)}
                      className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 text-[11px] transition shadow-sm shrink-0"
                    >
                      Usar en Setlist
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Contenido del Capítulo o Resultados de Búsqueda */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {searchExecuted ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Resultados para "{searchQuery}" ({searchResults.length})
                    </h3>
                    <button
                      onClick={() => {
                        setSearchExecuted(false);
                        setSearchQuery('');
                      }}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Volver a la lectura del capítulo
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">
                      No se encontraron versículos que coincidan con la búsqueda.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-amber-500/50 transition cursor-pointer"
                          onClick={() => navigateToPassage(item.book, item.chapter)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                              {item.book} {item.chapter}:{item.verse}
                            </span>
                            <span className="text-[10px] text-slate-400">Clic para ir al capítulo</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : isLoadingChapter ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mb-3" />
                  <p className="text-xs text-slate-400">Cargando versículos y referencias cruzadas...</p>
                </div>
              ) : chapterData.verses.length === 0 ? (
                <div className="text-center py-20 text-slate-400 space-y-2">
                  <BookOpen className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold">Capítulo sin versículos registrados en la base canónica</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Los pasajes emblemáticos como Salmos 23, 100, 150, Éxodo 20, Juan 1, 3, Romanos 8 y Filipenses 4 ya están cargados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-w-3xl mx-auto">
                  {chapterData.verses.map((v) => {
                    const highlightKey = `${v.book}-${v.chapter}-${v.verse}`;
                    const hlColor = highlights[highlightKey];

                    // Clases según color de resaltado
                    const hlClass = hlColor === 'yellow'
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-l-4 border-amber-500'
                      : hlColor === 'green'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 border-l-4 border-emerald-500'
                      : hlColor === 'blue'
                      ? 'bg-blue-100 dark:bg-blue-950/60 border-l-4 border-blue-500'
                      : hlColor === 'red'
                      ? 'bg-rose-100 dark:bg-rose-950/60 border-l-4 border-rose-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40';

                    // Referencias cruzadas para este versículo específico
                    const crossRefsForThisVerse = chapterData.crossRefs.filter(
                      cr => (cr.from_chapter === v.chapter && cr.from_verse === v.verse) ||
                            (cr.to_chapter === v.chapter && cr.to_verse === v.verse)
                    );

                    return (
                      <div
                        key={v.verse}
                        className={`group relative p-3 rounded-xl transition ${hlClass}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Número de versículo con menú de acciones */}
                          <div className="flex flex-col items-center shrink-0 pt-0.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                              {v.verse}
                            </span>
                          </div>

                          {/* Texto del versículo */}
                          <div className="flex-1 space-y-2">
                            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                              {v.text}
                            </p>

                            {/* Barra de herramientas ministerial del versículo */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] opacity-80 group-hover:opacity-100 transition">
                              {/* Proyectar Versículo */}
                              <button
                                onClick={() => setProjectedVerse(v)}
                                className="flex items-center gap-1 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition"
                                title="Proyectar en pantalla completa o atril"
                              >
                                <Monitor className="h-3 w-3" />
                                <span>Proyectar</span>
                              </button>

                              {/* Tarjeta Visual para Redes */}
                              <button
                                onClick={() => setVisualCardVerse(v)}
                                className="flex items-center gap-1 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition"
                                title="Generar tarjeta para WhatsApp o redes"
                              >
                                <Share2 className="h-3 w-3" />
                                <span>Tarjeta</span>
                              </button>

                              {/* Resaltador */}
                              <button
                                onClick={() => setHighlightMenuVerse(highlightMenuVerse?.verse === v.verse ? null : v)}
                                className="flex items-center gap-1 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition"
                              >
                                <Highlighter className="h-3 w-3" />
                                <span>Resaltar</span>
                              </button>

                              {/* Referencias Cruzadas */}
                              {crossRefsForThisVerse.length > 0 && (
                                <button
                                  onClick={() => handleInspectCrossRef(v)}
                                  className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                >
                                  <Link2 className="h-3 w-3" />
                                  <span>{crossRefsForThisVerse.length} Texto(s) Cruzado(s)</span>
                                </button>
                              )}
                            </div>

                            {/* Menú de colores de resaltado emergente */}
                            {highlightMenuVerse?.verse === v.verse && (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                                <span className="text-[10px] text-slate-400">Color:</span>
                                <button
                                  onClick={() => toggleHighlight(v, 'yellow')}
                                  className="h-4 w-4 rounded-full bg-amber-400 hover:scale-110 transition"
                                  title="Promesa de Dios (Amarillo)"
                                />
                                <button
                                  onClick={() => toggleHighlight(v, 'green')}
                                  className="h-4 w-4 rounded-full bg-emerald-400 hover:scale-110 transition"
                                  title="Alabanza y Gratitud (Verde)"
                                />
                                <button
                                  onClick={() => toggleHighlight(v, 'blue')}
                                  className="h-4 w-4 rounded-full bg-blue-400 hover:scale-110 transition"
                                  title="Doctrina y Fe (Azul)"
                                />
                                <button
                                  onClick={() => toggleHighlight(v, 'red')}
                                  className="h-4 w-4 rounded-full bg-rose-400 hover:scale-110 transition"
                                  title="Salvación y Cruz (Rojo)"
                                />
                                <button
                                  onClick={() => toggleHighlight(v, null)}
                                  className="text-[10px] text-slate-400 hover:text-red-500 ml-1"
                                >
                                  Quitar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PLANES DE LECTURA BÍBLICA EN 1 AÑO O MENOS (4 PLANES LÓGICOS) */}
      {/* ========================================================================= */}
      {activeMainTab === 'plans' && (
        <div className="flex flex-col lg:flex-row h-full gap-4">
          {/* Selector de los 4 Planes de Lectura */}
          <div className="w-full lg:w-80 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-xl p-4 shrink-0 space-y-3">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                <span>Planes de Lectura</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estructurados con orden lógico canónico, cronológico y ministerial.
              </p>
            </div>

            <div className="space-y-2">
              {BIBLE_READING_PLANS.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                const completedCount = (planCompletedDays[plan.id] || []).length;
                const percent = Math.round((completedCount / plan.totalDays) * 100);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition text-left space-y-1.5 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {plan.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {percent}%
                      </span>
                    </div>

                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {plan.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {plan.subtitle}
                    </p>

                    {/* Barra de progreso miniatura */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Área Principal del Plan Seleccionado */}
          <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-xl overflow-hidden p-5 space-y-4">
            {/* Cabecera del Plan */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{activePlan.title}</h2>
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    {activePlan.totalDays} Días
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mt-1">
                  {activePlan.description}
                </p>
              </div>

              {/* Estadísticas de progreso */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Días Leídos</span>
                  <span className="font-bold text-slate-900 dark:text-white text-base">
                    {completedForActivePlan.length} / {activePlan.totalDays}
                  </span>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                  <span className="text-slate-400 block text-[10px]">Progreso</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-base">
                    {percentCompleted}%
                  </span>
                </div>
              </div>
            </div>

            {/* Filtros de días: Todos, Pendientes, Completados */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setPlanFilter('all')}
                  className={`px-3 py-1 rounded font-medium transition ${
                    planFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Todos ({planDays.length})
                </button>
                <button
                  onClick={() => setPlanFilter('pending')}
                  className={`px-3 py-1 rounded font-medium transition ${
                    planFilter === 'pending'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Pendientes ({planDays.length - completedForActivePlan.length})
                </button>
                <button
                  onClick={() => setPlanFilter('completed')}
                  className={`px-3 py-1 rounded font-medium transition ${
                    planFilter === 'completed'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Completados ({completedForActivePlan.length})
                </button>
              </div>

              {completedForActivePlan.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('¿Deseas reiniciar el progreso de este plan de lectura?')) {
                      toggleDayCompletion(activePlan.id, -999);
                      const updated = { ...planCompletedDays, [activePlan.id]: [] };
                      setPlanCompletedDays(updated);
                      localStorage.setItem('bible_reading_progress', JSON.stringify(updated));
                    }
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Reiniciar Plan
                </button>
              )}
            </div>

            {/* Listado de Días del Plan */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[500px]">
              {planDays
                .filter(day => {
                  const isDone = completedForActivePlan.includes(day.day);
                  if (planFilter === 'pending') return !isDone;
                  if (planFilter === 'completed') return isDone;
                  return true;
                })
                .map((day) => {
                  const isDone = completedForActivePlan.includes(day.day);
                  const firstPassage = day.passages[0];

                  return (
                    <div
                      key={day.day}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                        isDone
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleDayCompletion(activePlan.id, day.day)}
                          className="text-slate-400 hover:text-emerald-500 transition"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {day.title}:
                            </span>
                            <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                              {day.referenceText}
                            </span>
                          </div>
                          {day.theme && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {day.theme}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botón para abrir y leer en el lector */}
                      <button
                        onClick={() => navigateToPassage(firstPassage.book, firstPassage.chapterStart)}
                        className="flex items-center gap-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 text-xs transition shrink-0"
                      >
                        <span>Leer</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: GUÍA LITÚRGICA POR MOMENTOS DEL CULTO */}
      {/* ========================================================================= */}
      {activeMainTab === 'liturgical' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-amber-500" />
              <span>Guía Litúrgica y Momentos del Culto</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pasajes bíblicos ordenados por momentos espirituales del servicio para directores de alabanza y pastores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LITURGICAL_MOMENTS.map((moment) => (
              <div
                key={moment.id}
                className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{moment.emoji}</span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{moment.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {moment.description}
                  </p>

                  <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                    <strong>Tonalidad sugerida:</strong> {moment.recommendedTone}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pasajes Clave:
                  </span>
                  {moment.passages.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigateToPassage(p.book, p.chapter)}
                      className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-left transition group"
                    >
                      <div className="truncate">
                        <span className="font-bold text-xs text-amber-600 dark:text-amber-400 block">
                          {p.reference}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                          {p.label}
                        </span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-amber-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 4: GLOSARIO MUSICAL HEBREO / LÉXICO DE ALABANZA */}
      {/* ========================================================================= */}
      {activeMainTab === 'terms' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-amber-500" />
              <span>Léxico y Exégesis Musical Hebrea para Músicos</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Las 7 palabras bíblicas hebreas para la alabanza y términos técnicos del templo de David.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HEBREW_WORSHIP_TERMS.map((term, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {term.strongNumber}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {term.transliteration}
                    </h3>
                  </div>
                  <span className="text-2xl font-serif text-slate-700 dark:text-slate-300">
                    {term.hebrew}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Significado:</strong> {term.meaning}
                </p>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/40 dark:bg-slate-900/60 p-2 rounded-lg">
                  <strong>Ejemplo Bíblico:</strong> {term.biblicalExample}
                </div>

                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <strong>Aplicación en el Ensayo:</strong> {term.musicalApplication}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PROYECCIÓN DE VERSÍCULOS EN PANTALLA COMPLETA / PÚLPITO / PROYECTOR */}
      {/* ========================================================================= */}
      {projectedVerse && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white p-6 md:p-12 animate-in fade-in duration-200">
          {/* Barra superior de control de proyección */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-amber-400 uppercase tracking-widest text-sm flex items-center gap-1.5">
                <Monitor className="h-4 w-4" />
                <span>Modo Proyección Iglesia</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>Reina Valera 1960</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setProjectionFontSize(Math.max(24, projectionFontSize - 4))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                title="Disminuir texto"
              >
                A-
              </button>
              <button
                onClick={() => setProjectionFontSize(Math.min(72, projectionFontSize + 4))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
                title="Aumentar texto"
              >
                A+
              </button>
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                    setIsProjectionFullscreen(true);
                  } else {
                    document.exitFullscreen().catch(() => {});
                    setIsProjectionFullscreen(false);
                  }
                }}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white"
                title="Pantalla Completa"
              >
                {isProjectionFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setProjectedVerse(null)}
                className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white ml-2"
                title="Cerrar proyección"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Versículo proyectado en el centro */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto text-center px-4">
            <p
              className="font-serif leading-relaxed text-amber-100/95 font-medium tracking-wide drop-shadow-md"
              style={{ fontSize: `${projectionFontSize}px` }}
            >
              «{projectedVerse.text}»
            </p>

            <div className="mt-8">
              <span className="text-xl md:text-2xl font-bold tracking-wider text-amber-400 bg-amber-500/10 px-5 py-2 rounded-full border border-amber-500/30">
                {projectedVerse.book} {projectedVerse.chapter}:{projectedVerse.verse}
              </span>
            </div>
          </div>

          {/* Barra inferior */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900 pt-3">
            <span>Presiona ESC o el botón cerrar para volver al gestor</span>
            <span>Ekklesia Music • Proyección Ministerial</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GENERADOR DE TARJETA VISUAL PARA WHATSAPP Y REDES SOCIALES */}
      {/* ========================================================================= */}
      {visualCardVerse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="flex flex-col w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm">Tarjeta Visual para WhatsApp / Redes</h3>
              </div>
              <button
                onClick={() => setVisualCardVerse(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Vista previa de la tarjeta */}
            <div className="p-6">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white shadow-xl text-center space-y-4 border border-amber-500/30">
                <span className="text-amber-400 text-3xl font-serif">“</span>
                <p className="font-serif text-base md:text-lg leading-relaxed text-amber-100">
                  {visualCardVerse.text}
                </p>
                <div className="pt-2">
                  <span className="font-bold text-sm text-amber-400 block tracking-wider">
                    {visualCardVerse.book} {visualCardVerse.chapter}:{visualCardVerse.verse}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                    Reina Valera 1960 • Ministerio de Alabanza
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones para compartir */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 py-3.5">
              <button
                onClick={() => handleCopyCardText(visualCardVerse)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs transition shadow-md shadow-amber-500/20"
              >
                {cardCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{cardCopied ? '¡Copiado para WhatsApp!' : 'Copiar Texto para WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REFERENCIAS CRUZADAS DETALLADAS */}
      {/* ========================================================================= */}
      {activeVerseForCrossRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="flex flex-col w-full max-w-xl max-h-[85vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm">
                  Textos Cruzados: {activeVerseForCrossRef.book} {activeVerseForCrossRef.chapter}:{activeVerseForCrossRef.verse}
                </h3>
              </div>
              <button
                onClick={() => setActiveVerseForCrossRef(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-amber-50/50 dark:bg-amber-950/20">
              <p className="text-xs italic text-slate-700 dark:text-slate-300">
                «{activeVerseForCrossRef.text}»
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingCrossRefs ? (
                <div className="py-8 text-center text-xs text-slate-400">Cargando textos cruzados...</div>
              ) : verseCrossRefs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No hay conexiones canónicas registradas para este versículo.
                </div>
              ) : (
                verseCrossRefs.map((ref) => {
                  const targetBook = ref.from_book === activeVerseForCrossRef.book ? ref.to_book : ref.from_book;
                  const targetChapter = ref.from_book === activeVerseForCrossRef.book ? ref.to_chapter : ref.from_chapter;
                  const targetVerse = ref.from_book === activeVerseForCrossRef.book ? ref.to_verse : ref.from_verse;

                  return (
                    <div
                      key={ref.id}
                      onClick={() => {
                        navigateToPassage(targetBook, targetChapter);
                        setActiveVerseForCrossRef(null);
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:border-amber-500/50 cursor-pointer transition space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                          {targetBook} {targetChapter}:{targetVerse}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>Ir al pasaje</span>
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                      {ref.note && (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {ref.note}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DESLIZABLE (BOTTOM SHEET) PARA CAMBIAR LIBRO EN MÓVIL               */}
      {/* ========================================================================= */}
      {isMobileBookSelectorOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl max-h-[85vh] flex flex-col space-y-3 animate-in slide-in-from-bottom duration-200 text-slate-800 dark:text-slate-100">
            {/* Tirador y cabecera */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mb-2" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Seleccionar Libro Bíblico
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileBookSelectorOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filtro de Testamento */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 dark:bg-slate-950 p-1 text-xs shrink-0">
              <button
                onClick={() => setSelectedTestament('all')}
                className={`rounded-lg py-1.5 font-bold transition ${
                  selectedTestament === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos (66)
              </button>
              <button
                onClick={() => setSelectedTestament('Antiguo Testamento')}
                className={`rounded-lg py-1.5 font-bold transition ${
                  selectedTestament === 'Antiguo Testamento'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Antiguo (39)
              </button>
              <button
                onClick={() => setSelectedTestament('Nuevo Testamento')}
                className={`rounded-lg py-1.5 font-bold transition ${
                  selectedTestament === 'Nuevo Testamento'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Nuevo (27)
              </button>
            </div>

            {/* Lista deslizable de libros */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[55vh]">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                      setSearchExecuted(false);
                      setIsMobileBookSelectorOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 text-left text-xs transition ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border-l-4 border-amber-500'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-semibold">{book.name}</span>
                      <span className="block text-[10px] text-slate-400">
                        {book.genre} • {book.chaptersCount} capítulos
                      </span>
                    </div>
                    {isSelected && (
                      <span className="rounded-full bg-amber-500 text-slate-950 p-1">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
