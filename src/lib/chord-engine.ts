/**
 * Motor de Teoría Musical, Acordes, Solfa (Solfeo Latino) y Transposición
 * Especializado para grupos de alabanza y ministerios musicales de iglesia.
 */

// Escala cromática en cifrado americano (sostenidos y bemoles)
export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapeo a Solfa (lenguaje musical en sílabas latinas)
export const NOTE_TO_SOLFA: Record<string, string> = {
  'C': 'Do',
  'C#': 'Do#',
  'Db': 'Reb',
  'D': 'Re',
  'D#': 'Re#',
  'Eb': 'Mib',
  'E': 'Mi',
  'F': 'Fa',
  'F#': 'Fa#',
  'Gb': 'Solb',
  'G': 'Sol',
  'G#': 'Sol#',
  'Ab': 'Lab',
  'A': 'La',
  'A#': 'La#',
  'Bb': 'Sib',
  'B': 'Si'
};

export const SOLFA_TO_NOTE: Record<string, string> = {
  'do': 'C', 'do#': 'C#', 'reb': 'Db',
  're': 'D', 're#': 'D#', 'mib': 'Eb',
  'mi': 'E',
  'fa': 'F', 'fa#': 'F#', 'solb': 'Gb',
  'sol': 'G', 'sol#': 'G#', 'lab': 'Ab',
  'la': 'A', 'la#': 'A#', 'sib': 'Bb',
  'si': 'B'
};

// Tonalidades comunes y su preferencia de alteraciones
export const KEY_PREFERENCES: Record<string, 'sharp' | 'flat'> = {
  'C': 'sharp', 'G': 'sharp', 'D': 'sharp', 'A': 'sharp', 'E': 'sharp', 'B': 'sharp', 'F#': 'sharp',
  'F': 'flat', 'Bb': 'flat', 'Eb': 'flat', 'Ab': 'flat', 'Db': 'flat', 'Gb': 'flat',
  'Am': 'sharp', 'Em': 'sharp', 'Bm': 'sharp', 'F#m': 'sharp', 'C#m': 'sharp',
  'Dm': 'flat', 'Gm': 'flat', 'Cm': 'flat', 'Fm': 'flat', 'Bbm': 'flat'
};

// Expresión regular para capturar un acorde (raíz, cualidad, bajo)
// Soporta tanto C, D#, Bb como Do, Re#, Mib
export const CHORD_REGEX = /^(Do#|Re#|Fa#|Sol#|La#|Reb|Mib|Solb|Lab|Sib|Do|Re|Mi|Fa|Sol|La|Si|[A-G][#b]?)([^/]*)(?:\/(Do#|Re#|Fa#|Sol#|La#|Reb|Mib|Solb|Lab|Sib|Do|Re|Mi|Fa|Sol|La|Si|[A-G][#b]?))?$/i;

// Expresión regular para detectar encabezados de secciones musicales
export const SECTION_HEADER_REGEX = /^\[(Intro|Verso|Verso\s*\d+|Pre-Coro|Coro|Puente|Interludio|Outro|Solo|Final|Coda|Estrofa|Estrofa\s*\d+)\]$/i;

/**
 * Normaliza cualquier nota raíz (sea en Solfa o Americano) a Cifrado Americano estándar
 */
export function normalizeRoot(note: string): string {
  const clean = note.trim();
  const lower = clean.toLowerCase();
  if (SOLFA_TO_NOTE[lower]) {
    return SOLFA_TO_NOTE[lower];
  }
  // Normalizar primera letra mayúscula y alteración
  const first = clean.charAt(0).toUpperCase();
  const acc = clean.slice(1);
  return first + acc;
}

/**
 * Convierte un acorde en cifrado americano a Solfa (Clave de solfa)
 * Ejemplos:
 *  "G" -> "Sol"
 *  "Em7" -> "Mim7"
 *  "D/F#" -> "Re/Fa#"
 *  "Asus4" -> "Lasus4"
 *  "Bbmaj7" -> "Sibmaj7"
 */
export function chordToSolfa(chord: string): string {
  const match = chord.match(CHORD_REGEX);
  if (!match) return chord;

  const [, root, quality = '', bass] = match;
  const normRoot = normalizeRoot(root);
  const solfaRoot = NOTE_TO_SOLFA[normRoot] || root;

  let solfaBass = '';
  if (bass) {
    const normBass = normalizeRoot(bass);
    solfaBass = '/' + (NOTE_TO_SOLFA[normBass] || bass);
  }

  return `${solfaRoot}${quality}${solfaBass}`;
}

/**
 * Convierte un acorde en Solfa a Cifrado Americano
 * Ejemplos:
 *  "Sol" -> "G"
 *  "Mim7" -> "Em7"
 *  "Re/Fa#" -> "D/F#"
 */
export function solfaToChord(solfaChord: string): string {
  const match = solfaChord.match(CHORD_REGEX);
  if (!match) return solfaChord;

  const [, root, quality = '', bass] = match;
  const americanRoot = normalizeRoot(root);

  let americanBass = '';
  if (bass) {
    americanBass = '/' + normalizeRoot(bass);
  }

  return `${americanRoot}${quality}${americanBass}`;
}

/**
 * Obtiene el índice semitonal (0-11) de una nota
 */
export function getNoteIndex(note: string): number {
  const norm = normalizeRoot(note);
  let idx = CHROMATIC_SHARPS.indexOf(norm);
  if (idx === -1) {
    idx = CHROMATIC_FLATS.indexOf(norm);
  }
  return idx;
}

/**
 * Transpone una nota N semitonos
 */
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const idx = getNoteIndex(note);
  if (idx === -1) return note;

  const scale = preferFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  const newIdx = (idx + semitones + 120) % 12;
  return scale[newIdx];
}

/**
 * Transpone un acorde completo (raíz, calidad y bajo)
 */
export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return chord;
  const match = chord.match(CHORD_REGEX);
  if (!match) return chord;

  const [, root, quality = '', bass] = match;
  const isSolfa = !!SOLFA_TO_NOTE[root.toLowerCase()];

  const americanRoot = normalizeRoot(root);
  const transposedRoot = transposeNote(americanRoot, semitones, preferFlats);

  let transposedBass = '';
  if (bass) {
    const americanBass = normalizeRoot(bass);
    transposedBass = '/' + transposeNote(americanBass, semitones, preferFlats);
  }

  const newAmerican = `${transposedRoot}${quality}${transposedBass}`;
  return isSolfa ? chordToSolfa(newAmerican) : newAmerican;
}

export type NotationType = 'american' | 'solfa' | 'degrees';

/**
 * Convierte un acorde al sistema de notación seleccionado
 */
export function formatChord(chord: string, notation: NotationType, key = 'C'): string {
  if (notation === 'solfa') {
    return chordToSolfa(chord);
  } else if (notation === 'american') {
    return solfaToChord(chord);
  } else if (notation === 'degrees') {
    return chordToDegree(chord, key);
  }
  return chord;
}

/**
 * Convierte un acorde a grados de la escala (Sistema Nashville / Grados armónicos)
 * Ej: En tonalidad de Sol (G): G -> I, C -> IV, D -> V, Em -> vi
 */
export function chordToDegree(chord: string, key = 'C'): string {
  const normKey = normalizeRoot(key.replace(/m$/, ''));
  const match = chord.match(CHORD_REGEX);
  if (!match) return chord;

  const [, root, quality = '', bass] = match;
  const normChordRoot = normalizeRoot(root);

  const keyIdx = getNoteIndex(normKey);
  const chordIdx = getNoteIndex(normChordRoot);
  if (keyIdx === -1 || chordIdx === -1) return chord;

  const semitonesFromKey = (chordIdx - keyIdx + 12) % 12;
  const degreeMap: Record<number, { major: string; minor: string }> = {
    0: { major: 'I', minor: 'i' },
    1: { major: 'bII', minor: 'bii' },
    2: { major: 'II', minor: 'ii' },
    3: { major: 'bIII', minor: 'biii' },
    4: { major: 'III', minor: 'iii' },
    5: { major: 'IV', minor: 'iv' },
    6: { major: '#IV', minor: '#iv' },
    7: { major: 'V', minor: 'v' },
    8: { major: 'bVI', minor: 'bvi' },
    9: { major: 'VI', minor: 'vi' },
    10: { major: 'bVII', minor: 'bvii' },
    11: { major: 'VII', minor: 'vii°' }
  };

  const isMinor = quality.startsWith('m') && !quality.startsWith('maj');
  const baseDegree = isMinor 
    ? (degreeMap[semitonesFromKey]?.minor || 'i') 
    : (degreeMap[semitonesFromKey]?.major || 'I');

  const cleanQuality = isMinor ? quality.slice(1) : quality;
  return `${baseDegree}${cleanQuality}${bass ? '/' + chordToDegree(bass, key) : ''}`;
}

export interface ParsedLine {
  type: 'section' | 'chords-and-lyrics' | 'lyrics-only' | 'empty';
  sectionName?: string;
  items?: Array<{
    chord?: string;
    lyric: string;
  }>;
  rawText?: string;
}

/**
 * Analizador y convertidor de texto musical
 * Procesa tanto formato ChordPro [G]Dios es [Em]bueno como texto plano con acordes arriba
 */
export function parseSongContent(content: string, semitones = 0, notation: NotationType = 'american', key = 'C'): ParsedLine[] {
  const lines = content.split('\n');
  const result: ParsedLine[] = [];

  const preferFlats = KEY_PREFERENCES[key] === 'flat';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push({ type: 'empty' });
      continue;
    }

    // Detección de encabezados de sección: [Coro], [Verso 1], [Puente], etc.
    const sectionMatch = trimmed.match(/^\[(Intro|Verso|Verso\s*\d+|Pre-Coro|Coro|Puente|Interludio|Outro|Solo|Final|Coda|Estrofa|Estrofa\s*\d+)\]$/i);
    if (sectionMatch) {
      result.push({
        type: 'section',
        sectionName: sectionMatch[1]
      });
      continue;
    }

    // Formato ChordPro: detecta corchetes con acordes inline [G]Tu fidelidad...
    if (line.includes('[') && line.includes(']')) {
      const items: Array<{ chord?: string; lyric: string }> = [];
      const parts = line.split(/(\[[^\]]+\])/);

      let currentChord: string | undefined = undefined;

      for (const part of parts) {
        if (!part) continue;
        if (part.startsWith('[') && part.endsWith(']')) {
          const chordRaw = part.slice(1, -1).trim();
          // Verificar si es un acorde válido
          if (CHORD_REGEX.test(chordRaw)) {
            const transposed = transposeChord(chordRaw, semitones, preferFlats);
            currentChord = formatChord(transposed, notation, key);
          } else {
            // No es un acorde (podría ser una anotación)
            items.push({ lyric: part });
          }
        } else {
          items.push({
            chord: currentChord,
            lyric: part
          });
          currentChord = undefined;
        }
      }

      if (currentChord) {
        items.push({ chord: currentChord, lyric: '' });
      }

      result.push({
        type: 'chords-and-lyrics',
        items
      });
      continue;
    }

    // Detección de línea tradicional con acordes (cuando la línea actual contiene solo acordes)
    // y la siguiente línea contiene la letra
    const isChordLine = checkIfChordLine(trimmed);
    if (isChordLine && i + 1 < lines.length && !checkIfChordLine(lines[i + 1].trim())) {
      const chordLine = line;
      const lyricLine = lines[i + 1];
      i++; // consumir la siguiente línea

      const mergedItems = mergeChordAndLyricLines(chordLine, lyricLine, semitones, notation, key, preferFlats);
      result.push({
        type: 'chords-and-lyrics',
        items: mergedItems
      });
      continue;
    } else if (isChordLine) {
      // Línea de solo acordes (por ejemplo intro o instrumental)
      const chordTokens = trimmed.split(/\s+/).filter(Boolean);
      const items = chordTokens.map(c => {
        const transposed = transposeChord(c, semitones, preferFlats);
        return {
          chord: formatChord(transposed, notation, key),
          lyric: '    '
        };
      });
      result.push({
        type: 'chords-and-lyrics',
        items
      });
      continue;
    }

    // Línea regular de letra
    result.push({
      type: 'lyrics-only',
      rawText: line
    });
  }

  return result;
}

/**
 * Comprueba si una línea está compuesta predominantemente por acordes
 */
function checkIfChordLine(line: string): boolean {
  if (!line) return false;
  const tokens = line.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  for (const token of tokens) {
    if (CHORD_REGEX.test(token)) {
      chordCount++;
    }
  }

  return chordCount / tokens.length >= 0.7;
}

/**
 * Fusiona una línea tradicional de acordes con la línea de letra que está debajo
 */
function mergeChordAndLyricLines(
  chordLine: string,
  lyricLine: string,
  semitones: number,
  notation: NotationType,
  key: string,
  preferFlats: boolean
): Array<{ chord?: string; lyric: string }> {
  const items: Array<{ chord?: string; lyric: string }> = [];
  const chordMatches: Array<{ index: number; chord: string }> = [];

  const regex = /(\S+)/g;
  let match;
  while ((match = regex.exec(chordLine)) !== null) {
    if (CHORD_REGEX.test(match[1])) {
      const transposed = transposeChord(match[1], semitones, preferFlats);
      const formatted = formatChord(transposed, notation, key);
      chordMatches.push({
        index: match.index,
        chord: formatted
      });
    }
  }

  if (chordMatches.length === 0) {
    return [{ lyric: lyricLine }];
  }

  let lastIndex = 0;
  for (let i = 0; i < chordMatches.length; i++) {
    const cur = chordMatches[i];
    const next = chordMatches[i + 1];

    if (cur.index > lastIndex) {
      const preLyric = lyricLine.slice(lastIndex, cur.index);
      if (preLyric) {
        items.push({ lyric: preLyric });
      }
    }

    const endIdx = next ? next.index : Math.max(lyricLine.length, cur.index + 1);
    const chunkLyric = lyricLine.slice(cur.index, endIdx);

    items.push({
      chord: cur.chord,
      lyric: chunkLyric || ' '
    });

    lastIndex = endIdx;
  }

  if (lastIndex < lyricLine.length) {
    items.push({ lyric: lyricLine.slice(lastIndex) });
  }

  return items;
}

/**
 * Diagramas de digitación para guitarra y notas para teclado/piano
 */
export interface ChordDiagramData {
  name: string;
  guitar: {
    frets: number[]; // -1 = mute, 0 = open, 1-12 = fret
    fingers?: number[];
    barres?: number[];
  };
  piano: {
    notes: string[]; // Notas del acorde ej ['C', 'E', 'G']
  };
}

export const CHORD_DIAGRAMS: Record<string, ChordDiagramData> = {
  'C': {
    name: 'C (Do Mayor)',
    guitar: { frets: [-1, 3, 2, 0, 1, 0] },
    piano: { notes: ['C', 'E', 'G'] }
  },
  'D': {
    name: 'D (Re Mayor)',
    guitar: { frets: [-1, -1, 0, 2, 3, 2] },
    piano: { notes: ['D', 'F#', 'A'] }
  },
  'E': {
    name: 'E (Mi Mayor)',
    guitar: { frets: [0, 2, 2, 1, 0, 0] },
    piano: { notes: ['E', 'G#', 'B'] }
  },
  'F': {
    name: 'F (Fa Mayor)',
    guitar: { frets: [1, 3, 3, 2, 1, 1], barres: [1] },
    piano: { notes: ['F', 'A', 'C'] }
  },
  'G': {
    name: 'G (Sol Mayor)',
    guitar: { frets: [3, 2, 0, 0, 0, 3] },
    piano: { notes: ['G', 'B', 'D'] }
  },
  'A': {
    name: 'A (La Mayor)',
    guitar: { frets: [-1, 0, 2, 2, 2, 0] },
    piano: { notes: ['A', 'C#', 'E'] }
  },
  'B': {
    name: 'B (Si Mayor)',
    guitar: { frets: [-1, 2, 4, 4, 4, 2], barres: [2] },
    piano: { notes: ['B', 'D#', 'F#'] }
  },
  'Em': {
    name: 'Em (Mi Menor)',
    guitar: { frets: [0, 2, 2, 0, 0, 0] },
    piano: { notes: ['E', 'G', 'B'] }
  },
  'Am': {
    name: 'Am (La Menor)',
    guitar: { frets: [-1, 0, 2, 2, 1, 0] },
    piano: { notes: ['A', 'C', 'E'] }
  },
  'Dm': {
    name: 'Dm (Re Menor)',
    guitar: { frets: [-1, -1, 0, 2, 3, 1] },
    piano: { notes: ['D', 'F', 'A'] }
  },
  'Bm': {
    name: 'Bm (Si Menor)',
    guitar: { frets: [-1, 2, 4, 4, 3, 2], barres: [2] },
    piano: { notes: ['B', 'D', 'F#'] }
  },
  'F#m': {
    name: 'F#m (Fa# Menor)',
    guitar: { frets: [2, 4, 4, 2, 2, 2], barres: [2] },
    piano: { notes: ['F#', 'A', 'C#'] }
  },
  'C#m': {
    name: 'C#m (Do# Menor)',
    guitar: { frets: [-1, 4, 6, 6, 5, 4], barres: [4] },
    piano: { notes: ['C#', 'E', 'G#'] }
  },
  'G/B': {
    name: 'G/B (Sol con bajo en Si)',
    guitar: { frets: [-1, 2, 0, 0, 3, 3] },
    piano: { notes: ['B', 'D', 'G'] }
  },
  'D/F#': {
    name: 'D/F# (Re con bajo en Fa#)',
    guitar: { frets: [2, 0, 0, 2, 3, 2] },
    piano: { notes: ['F#', 'A', 'D'] }
  },
  'C/E': {
    name: 'C/E (Do con bajo en Mi)',
    guitar: { frets: [0, 3, 2, 0, 1, 0] },
    piano: { notes: ['E', 'G', 'C'] }
  },
  'Dsus4': {
    name: 'Dsus4 (Re suspendido 4)',
    guitar: { frets: [-1, -1, 0, 2, 3, 3] },
    piano: { notes: ['D', 'G', 'A'] }
  },
  'Gsus4': {
    name: 'Gsus4 (Sol suspendido 4)',
    guitar: { frets: [3, 3, 0, 0, 1, 3] },
    piano: { notes: ['G', 'C', 'D'] }
  },
  'Asus4': {
    name: 'Asus4 (La suspendido 4)',
    guitar: { frets: [-1, 0, 2, 2, 3, 0] },
    piano: { notes: ['A', 'D', 'E'] }
  }
};

/**
 * Instrumentos transpositores habituales en ministerios de alabanza
 */
export type InstrumentKey = 'C' | 'Bb' | 'Eb' | 'F';

export interface InstrumentInfo {
  id: InstrumentKey;
  name: string;
  transpositionSemitones: number;
  description: string;
}

export const INSTRUMENTS: InstrumentInfo[] = [
  { id: 'C', name: 'Tono Concierto (Piano, Guitarra, Voz, Bajo)', transpositionSemitones: 0, description: 'Do / C' },
  { id: 'Bb', name: 'Instrumento en Sib (Trompeta, Saxo Tenor, Clarinete)', transpositionSemitones: 2, description: 'Sib / Bb (+2 st)' },
  { id: 'Eb', name: 'Instrumento en Mib (Saxo Alto, Saxo Barítono)', transpositionSemitones: 9, description: 'Mib / Eb (+9 st)' },
  { id: 'F', name: 'Instrumento en Fa (Corno Francés)', transpositionSemitones: 7, description: 'Fa / F (+7 st)' },
];

/**
 * Calculadora Inteligente de Cejilla / Capo para Guitarristas
 */
export interface CapoOption {
  capoFret: number;
  shapeKey: string;
  shapeSolfa: string;
  difficulty: 'fácil' | 'intermedio';
  description: string;
  isRecommended?: boolean;
}

export function getCapoOptions(concertKey: string): CapoOption[] {
  const normKey = normalizeRoot(concertKey || 'G');
  const isMinor = concertKey.toLowerCase().includes('m') && !concertKey.toLowerCase().includes('maj');
  
  // Posiciones de acordes abiertos resonantes y cómodos para guitarra
  const targetShapes = isMinor 
    ? ['Am', 'Em', 'Dm'] 
    : ['G', 'C', 'D', 'E', 'A'];

  const options: CapoOption[] = [];

  for (let fret = 1; fret <= 9; fret++) {
    // Si ponemos capo en traste N, la forma que tocamos debe estar N semitonos más abajo
    const shapeNote = transposeNote(normKey, -fret);
    const shapeFull = isMinor ? `${shapeNote}m` : shapeNote;

    const baseShape = isMinor ? shapeFull : shapeNote;
    if (targetShapes.includes(baseShape)) {
      const isSuperEasy = ['G', 'C', 'D', 'Am', 'Em'].includes(baseShape);
      options.push({
        capoFret: fret,
        shapeKey: shapeFull,
        shapeSolfa: NOTE_TO_SOLFA[shapeNote] ? (isMinor ? `${NOTE_TO_SOLFA[shapeNote]}m` : NOTE_TO_SOLFA[shapeNote]) : shapeFull,
        difficulty: isSuperEasy ? 'fácil' : 'intermedio',
        description: `Capo en Traste ${fret} tocando en forma de ${shapeFull}`,
        isRecommended: fret <= 4 && isSuperEasy
      });
    }
  }

  // Ordenar por recomendados primero y luego por traste
  return options.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    return a.capoFret - b.capoFret;
  });
}

/**
 * Remueve acordes entre corchetes o líneas completas de acordes,
 * dejando únicamente la letra limpia para proyección congregacional o teleprompter.
 */
export function stripChords(content: string): string {
  if (!content) return '';
  const lines = content.split('\n');
  const cleanLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Conservar etiquetas de sección como [Coro], [Verso 1], [Puente]
    if (SECTION_HEADER_REGEX.test(trimmed)) {
      cleanLines.push(trimmed);
      continue;
    }
    // Descartar líneas donde la mayoría de tokens son acordes
    if (checkIfChordLine(trimmed)) {
      continue;
    }
    // Limpiar acordes inline tipo [G], [Am7], [D/F#]
    const stripped = line.replace(/\[[A-G][b#]?[^\]]*\]/g, '');
    cleanLines.push(stripped);
  }

  return cleanLines.join('\n');
}

