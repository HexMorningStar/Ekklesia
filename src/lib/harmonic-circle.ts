/**
 * Motor del Círculo Armónico y Asistente de Acompañamiento Espontáneo
 * Especializado para acompañar oraciones, cánticos espontáneos y ministración
 * cuando no se conoce la nota base o tonalidad inicial.
 */

import { NOTE_TO_SOLFA, normalizeRoot, transposeNote } from './chord-engine';

export interface HarmonicKeyInfo {
  index: number; // 0 a 11 en el círculo de quintas
  key: string; // ej: 'G'
  solfa: string; // ej: 'Sol'
  relativeMinor: string; // ej: 'Em'
  relativeMinorSolfa: string; // ej: 'Mim'
  accidentals: number; // + para sostenidos, - para bemoles
  accidentalLabel: string; // ej: '1 Sostenido (F#)'
  diatonicScale: string[]; // 7 notas de la escala mayor
  
  // Familia armónica completa (Grados I al vii°)
  chords: {
    I: string;
    ii: string;
    iii: string;
    IV: string;
    V: string;
    vi: string;
    viiDim: string;
  };

  // Versión en Solfa
  chordsSolfa: {
    I: string;
    ii: string;
    iii: string;
    IV: string;
    V: string;
    vi: string;
    viiDim: string;
  };

  // Progresiones recomendadas para ministración y oración
  progressions: Array<{
    name: string;
    description: string;
    degrees: string;
    chordsAmerican: string[];
    chordsSolfa: string[];
    pedalNotes: string;
    guitarTip: string;
  }>;
}

// 12 Tonalidades del círculo de quintas en orden horario (C = 12 en punto)
export const CIRCLE_OF_FIFTHS: Array<{
  key: string;
  relativeMinor: string;
  accidentals: number;
  accidentalLabel: string;
}> = [
  { key: 'C',  relativeMinor: 'Am',  accidentals: 0,  accidentalLabel: 'Natural (Sin alteraciones)' },
  { key: 'G',  relativeMinor: 'Em',  accidentals: 1,  accidentalLabel: '1 Sostenido (F#)' },
  { key: 'D',  relativeMinor: 'Bm',  accidentals: 2,  accidentalLabel: '2 Sostenidos (F#, C#)' },
  { key: 'A',  relativeMinor: 'F#m', accidentals: 3,  accidentalLabel: '3 Sostenidos (F#, C#, G#)' },
  { key: 'E',  relativeMinor: 'C#m', accidentals: 4,  accidentalLabel: '4 Sostenidos (F#, C#, G#, D#)' },
  { key: 'B',  relativeMinor: 'G#m', accidentals: 5,  accidentalLabel: '5 Sostenidos (F#, C#, G#, D#, A#)' },
  { key: 'F#', relativeMinor: 'D#m', accidentals: 6,  accidentalLabel: '6 Sostenidos (F#, C#, G#, D#, A#, E#)' },
  { key: 'Db', relativeMinor: 'Bbm', accidentals: -5, accidentalLabel: '5 Bemoles (Bb, Eb, Ab, Db, Gb)' },
  { key: 'Ab', relativeMinor: 'Fm',  accidentals: -4, accidentalLabel: '4 Bemoles (Bb, Eb, Ab, Db)' },
  { key: 'Eb', relativeMinor: 'Cm',  accidentals: -3, accidentalLabel: '3 Bemoles (Bb, Eb, Ab)' },
  { key: 'Bb', relativeMinor: 'Gm',  accidentals: -2, accidentalLabel: '2 Bemoles (Bb, Eb)' },
  { key: 'F',  relativeMinor: 'Dm',  accidentals: -1, accidentalLabel: '1 Bemol (Bb)' }
];

// Frecuencia habitual en iglesias (para ordenar sugerencias al buscar de oído)
export const WORSHIP_KEY_POPULARITY: Record<string, number> = {
  'G': 100,
  'D': 95,
  'C': 90,
  'E': 85,
  'A': 80,
  'F': 75,
  'Bb': 60,
  'Eb': 50,
  'B': 45,
  'Ab': 40,
  'F#': 35,
  'Db': 30
};

// Genera la información armónica completa de una tonalidad
export function getHarmonicKeyInfo(key: string): HarmonicKeyInfo {
  const normKey = normalizeRoot(key || 'C');
  const foundIndex = CIRCLE_OF_FIFTHS.findIndex(c => c.key === normKey);
  const index = foundIndex >= 0 ? foundIndex : 0;
  const base = CIRCLE_OF_FIFTHS[index];

  // Grados mayores
  const I = base.key;
  const ii = `${transposeNote(I, 2)}m`;
  const iii = `${transposeNote(I, 4)}m`;
  const IV = transposeNote(I, 5);
  const V = transposeNote(I, 7);
  const vi = base.relativeMinor;
  const viiDim = `${transposeNote(I, 11)}dim`;

  const chords = { I, ii, iii, IV, V, vi, viiDim };

  // Convertir a Solfa
  const toSolfaChord = (ch: string) => {
    const root = normalizeRoot(ch.replace(/m|dim|7|sus4/g, ''));
    const suffix = ch.slice(root.length);
    const solfaName = NOTE_TO_SOLFA[root] || root;
    return solfaName + suffix;
  };

  const chordsSolfa = {
    I: toSolfaChord(I),
    ii: toSolfaChord(ii),
    iii: toSolfaChord(iii),
    IV: toSolfaChord(IV),
    V: toSolfaChord(V),
    vi: toSolfaChord(vi),
    viiDim: toSolfaChord(viiDim)
  };

  // Notas de la escala mayor
  const diatonicScale = [
    I,
    transposeNote(I, 2),
    transposeNote(I, 4),
    transposeNote(I, 5),
    transposeNote(I, 7),
    transposeNote(I, 9),
    transposeNote(I, 11)
  ];

  // Progresiones estándar de ministración
  const progressions = [
    {
      name: 'Flujo de Ministración y Oración',
      description: 'La progresión más suave, emotiva y segura para acompañar a alguien orando o hablando.',
      degrees: 'I — V/3ra — vi — IV',
      chordsAmerican: [I, `${V}/${chords.iii.replace('m', '')}`, vi, IV],
      chordsSolfa: [chordsSolfa.I, `${chordsSolfa.V}/${toSolfaChord(chords.iii.replace('m', ''))}`, chordsSolfa.vi, chordsSolfa.IV],
      pedalNotes: `Mantener tónica (${I}) y quinta (${V}) como notas fijas arriba`,
      guitarTip: `En guitarra, deja libres las cuerdas 1 y 2 sonando al aire o en traste 3 para un sonido moderno y abierto.`
    },
    {
      name: 'Atmósfera Contemplativa',
      description: 'Ideal para momentos íntimos de fondo musical mientras se lee la palabra de Dios.',
      degrees: 'I — IVmaj7 — I — IVmaj7',
      chordsAmerican: [I, `${IV}maj7`, I, `${IV}maj7`],
      chordsSolfa: [chordsSolfa.I, `${chordsSolfa.IV}maj7`, chordsSolfa.I, `${chordsSolfa.IV}maj7`],
      pedalNotes: `Bajo en ${I} continuo en el piano (pedal point)`,
      guitarTip: `Tocar arpegios lentos sin marcar ritmo percusivo.`
    },
    {
      name: 'Clamor y Elevación Espontánea',
      description: 'Para cuando la oración sube de intensidad y la congregación empieza a unirse.',
      degrees: 'vi — IV — I — V',
      chordsAmerican: [vi, IV, I, V],
      chordsSolfa: [chordsSolfa.vi, chordsSolfa.IV, chordsSolfa.I, chordsSolfa.V],
      pedalNotes: `Entrada progresiva de dinámicas con crescendo`,
      guitarTip: `Rasgueo abierto de crescendo hacia el coro.`
    },
    {
      name: 'Himno de Gratitud Solemne',
      description: 'Estructura clásica armónica que transmite reverencia y paz.',
      degrees: 'I — vi — ii — V7',
      chordsAmerican: [I, vi, ii, `${V}7`],
      chordsSolfa: [chordsSolfa.I, chordsSolfa.vi, chordsSolfa.ii, `${chordsSolfa.V}7`],
      pedalNotes: `Cadencia resolutiva perfecta hacia la tónica`,
      guitarTip: `Excelente para coros tradicionales y canciones clásicas de adoración.`
    }
  ];

  return {
    index,
    key: base.key,
    solfa: NOTE_TO_SOLFA[base.key] || base.key,
    relativeMinor: base.relativeMinor,
    relativeMinorSolfa: toSolfaChord(base.relativeMinor),
    accidentals: base.accidentals,
    accidentalLabel: base.accidentalLabel,
    diatonicScale,
    chords,
    chordsSolfa,
    progressions
  };
}

/**
 * BUSCADOR DE TONO POR NOTA DE OÍDO (Ear Pitch Matcher)
 * Cuando alguien empieza a cantar una melodía sin decir el tono, el músico
 * identifica qué nota está cantando (o probando en el piano) y el sistema
 * encuentra todas las tonalidades compatibles ordenadas por probabilidad ministerial.
 */
export interface CandidateKeyMatch {
  key: string;
  solfa: string;
  relativeMinor: string;
  roleInKey: string; // ej: 'Tónica (1er Grado)', 'Quinta Dominante (5to Grado)', etc.
  confidenceScore: number; // 0 a 100
  firstChordToTry: string; // El primer acorde seguro para acompañar
  firstChordSolfa: string;
  info: HarmonicKeyInfo;
}

export function findCandidateKeysByMelodyNote(melodyNote: string): CandidateKeyMatch[] {
  const normMelody = normalizeRoot(melodyNote || 'G');
  const matches: CandidateKeyMatch[] = [];

  for (const circleItem of CIRCLE_OF_FIFTHS) {
    const info = getHarmonicKeyInfo(circleItem.key);
    const scale = info.diatonicScale;

    // Buscar si la nota cantada está en la escala mayor de este tono
    const degreeIndex = scale.findIndex(n => normalizeRoot(n) === normMelody);

    if (degreeIndex !== -1) {
      let role = '';
      let scoreBonus = 0;
      let firstChord = info.chords.I;

      switch (degreeIndex) {
        case 0:
          role = 'Tónica (1er Grado - Muy Probable)';
          scoreBonus = 40;
          firstChord = info.chords.I;
          break;
        case 4:
          role = 'Quinta Dominante (5to Grado - Muy Común)';
          scoreBonus = 35;
          firstChord = info.chords.I; // La tónica armoniza la 5ta perfectamente
          break;
        case 2:
          role = 'Tercera (3er Grado - Tono Emotivo)';
          scoreBonus = 30;
          firstChord = info.chords.I;
          break;
        case 3:
          role = 'Subdominante (4to Grado)';
          scoreBonus = 20;
          firstChord = info.chords.IV;
          break;
        case 1:
          role = 'Segunda (2do Grado)';
          scoreBonus = 15;
          firstChord = info.chords.V;
          break;
        case 5:
          role = 'Sexta (Relativo Menor)';
          scoreBonus = 25;
          firstChord = info.chords.vi;
          break;
        case 6:
          role = 'Sensible (7mo Grado)';
          scoreBonus = 10;
          firstChord = info.chords.V;
          break;
      }

      const popularity = WORSHIP_KEY_POPULARITY[info.key] || 30;
      const totalScore = Math.min(100, scoreBonus + Math.round(popularity * 0.6));

      matches.push({
        key: info.key,
        solfa: info.solfa,
        relativeMinor: info.relativeMinor,
        roleInKey: role,
        confidenceScore: totalScore,
        firstChordToTry: firstChord,
        firstChordSolfa: NOTE_TO_SOLFA[firstChord] || firstChord,
        info
      });
    }
  }

  // Ordenar por score de mayor a menor
  return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Sintetizador Web Audio API de un tono de prueba (Bip de afinación/oído)
 * Permite al músico tocar la nota en la app para verificar si coincide con la voz del pastor/cantante
 */
export function playAuditoryReferenceTone(noteName: string) {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();

    // Frecuencias base en 4ta octava
    const noteFrequencies: Record<string, number> = {
      'C': 261.63,
      'C#': 277.18,
      'Db': 277.18,
      'D': 293.66,
      'D#': 311.13,
      'Eb': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F#': 369.99,
      'Gb': 369.99,
      'G': 392.00,
      'G#': 415.30,
      'Ab': 415.30,
      'A': 440.00,
      'A#': 466.16,
      'Bb': 466.16,
      'B': 493.88
    };

    const norm = normalizeRoot(noteName);
    const freq = noteFrequencies[norm] || 440;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Timbre suave tipo piano eléctrico / Rhodes
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (e) {
    // Audio context background fallback
  }
}
