import { normalizeRoot, transposeNote, NOTE_TO_SOLFA } from './chord-engine';

export interface HarmonicTransition {
  fromKey: string;
  toKey: string;
  semitoneDiff: number;
  compatibilityScore: number; // 1 a 5
  type: 'identical' | 'relative' | 'dominant' | 'subdominant' | 'climax_step' | 'direct_step' | 'distant';
  badgeLabel: string;
  badgeColor: string; // Tailwind class
  explanation: string;
  transitionChords: string[];
  musicianTip: string;
}

const CHROMATIC_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11
};

export function analyzeHarmonicTransition(fromKey: string, toKey: string): HarmonicTransition {
  const normFrom = normalizeRoot(fromKey || 'G');
  const normTo = normalizeRoot(toKey || 'G');
  
  const fromMinor = fromKey.toLowerCase().includes('m') && !fromKey.toLowerCase().includes('maj');
  const toMinor = toKey.toLowerCase().includes('m') && !toKey.toLowerCase().includes('maj');

  const idxFrom = CHROMATIC_INDEX[normFrom] ?? 0;
  const idxTo = CHROMATIC_INDEX[normTo] ?? 0;

  let diff = (idxTo - idxFrom + 12) % 12;

  // 1. Mismo tono
  if (diff === 0 && fromMinor === toMinor) {
    return {
      fromKey,
      toKey,
      semitoneDiff: 0,
      compatibilityScore: 5,
      type: 'identical',
      badgeLabel: 'Mismo Tono (Fluidez Total)',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      explanation: 'Ambas canciones están exactamente en la misma tonalidad. No se requiere modulación.',
      transitionChords: [fromKey, `${fromKey}sus4`, toKey],
      musicianTip: 'Mantén el pad o colchón de sintetizador sonando continuo sin detener el pulso rítmico.'
    };
  }

  // 2. Relativo menor / mayor (ej. C <-> Am, G <-> Em)
  if ((!fromMinor && toMinor && diff === 9) || (fromMinor && !toMinor && diff === 3)) {
    const bridgeChord = fromMinor ? transposeNote(normFrom, 2) : transposeNote(normFrom, -1);
    return {
      fromKey,
      toKey,
      semitoneDiff: diff,
      compatibilityScore: 5,
      type: 'relative',
      badgeLabel: 'Tono Relativo (Enlace Perfecto)',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      explanation: `Transición armónica natural entre tono ${fromMinor ? 'menor y su relativo mayor' : 'mayor y su relativo menor'} (comparten casi todas las notas).`,
      transitionChords: [fromKey, bridgeChord, toKey],
      musicianTip: 'Excelente para pasar de una alabanza alegre a un momento de adoración íntima o viceversa.'
    };
  }

  // 3. Modulación de Clímax (+2 semitonos: ej. D -> E, G -> A, C -> D)
  if (diff === 2) {
    const dominantChord = `${transposeNote(normTo, 7)}7`; // Dominante V7 del nuevo tono
    return {
      fromKey,
      toKey,
      semitoneDiff: 2,
      compatibilityScore: 5,
      type: 'climax_step',
      badgeLabel: 'Modulación de Clímax (+2 st)',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      explanation: 'Subida de 1 tono completo (+2 semitonos). Es la modulación más gloriosa en música cristiana para elevar la fe congregacional.',
      transitionChords: [fromKey, dominantChord, toKey],
      musicianTip: `Tocar el acorde dominante [${dominantChord}] en compás 4 con redoble de platillo antes de entrar con fuerza a [${toKey}].`
    };
  }

  // 4. Modulación ascendente directa (+1 semitono: ej. Eb -> E, C -> Db)
  if (diff === 1) {
    const dominantChord = `${transposeNote(normTo, 7)}7`;
    return {
      fromKey,
      toKey,
      semitoneDiff: 1,
      compatibilityScore: 4,
      type: 'direct_step',
      badgeLabel: 'Subida Directa (+1 st)',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      explanation: 'Sube medio tono cromático hacia arriba. Produce una elevación energética inmediata en la atmósfera.',
      transitionChords: [fromKey, dominantChord, toKey],
      musicianTip: 'El bajista puede hacer una escala cromática ascendente hacia la nueva fundamental.'
    };
  }

  // 5. Relación de Quinta Justa (Dominante: C -> G diff=7; o Subdominante: G -> C diff=5)
  if (diff === 7 || diff === 5) {
    const isFifth = diff === 7;
    const bridge = `${transposeNote(normTo, 7)}7`;
    return {
      fromKey,
      toKey,
      semitoneDiff: diff,
      compatibilityScore: 5,
      type: isFifth ? 'dominant' : 'subdominant',
      badgeLabel: isFifth ? 'Círculo de Quintas (V)' : 'Relación de Cuarta (IV)',
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      explanation: `Salto armónico de ${isFifth ? 'quinta justa (dominante)' : 'cuarta justa (subdominante)'}. Conexión clásica en himnología y adoración contemporánea.`,
      transitionChords: [fromKey, bridge, toKey],
      musicianTip: 'El piano puede hacer un arpegio ascendente para resolver naturalmente en el nuevo tono.'
    };
  }

  // 6. Transición más distante
  const dominantChord = `${transposeNote(normTo, 7)}7`;
  const subdominantBridge = transposeNote(normTo, 5);
  return {
    fromKey,
    toKey,
    semitoneDiff: diff,
    compatibilityScore: 3,
    type: 'distant',
    badgeLabel: `Cambio Tonal (${diff} st)`,
    badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    explanation: `Diferencia de ${diff} semitonos. Se recomienda pasar por el acorde dominante puente para preparar el oído de la congregación.`,
    transitionChords: [fromKey, subdominantBridge, dominantChord, toKey],
    musicianTip: `Haz una pausa breve con pad ambiental o un arpegio sobre [${dominantChord}] antes de empezar la canción en [${toKey}].`
  };
}
