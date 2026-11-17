/**
 * Motor de Transiciones y Modulaciones Musicales para Alabanza y Adoración
 * Calcula cadencias armónicas, acordes pivote, dominantes secundarias y
 * genera recomendaciones por instrumento (Teclados, Guitarra, Batería, Bajo).
 */

import { CHROMATIC_SHARPS, CHROMATIC_FLATS, transposeChord } from './chord-engine';

export interface TransitionStep {
  chord: string;
  durationBeats: number;
  explanation: string;
  role: 'sustain' | 'pivot' | 'dominant' | 'resolution';
}

export interface TransitionResult {
  sourceKey: string;
  targetKey: string;
  sourceTempo?: number;
  targetTempo?: number;
  intervalName: string;
  transitionType: string;
  chordsSequence: string[];
  steps: TransitionStep[];
  keyboardAdvice: string;
  guitarAdvice: string;
  drumsAdvice: string;
  bassAdvice: string;
  worshipLeaderAdvice: string;
}

// Mapeo de intervalos cromáticos a nombres musicales
const INTERVAL_NAMES: Record<number, string> = {
  0: 'Misma Tonalidad (Unísono)',
  1: 'Segunda Menor Arriba (+1 semitono)',
  2: 'Segunda Mayor Arriba (+1 tono)',
  3: 'Tercera Menor Arriba (+3 semitonos)',
  4: 'Tercera Mayor Arriba (+2 tonos)',
  5: 'Cuarta Justa Arriba (+5 semitonos)',
  6: 'Tritono (+6 semitonos)',
  7: 'Quinta Justa Arriba (+7 semitonos)',
  8: 'Sexta Menor Arriba (+8 semitonos)',
  9: 'Sexta Mayor Arriba (+9 semitonos)',
  10: 'Séptima Menor Arriba (+10 semitonos)',
  11: 'Séptima Mayor Arriba (+11 semitonos)',
};

/**
 * Calcula la modulación armónica óptima entre dos canciones
 */
export function calculateTransition(
  sourceKey: string,
  targetKey: string,
  sourceTempo: number = 72,
  targetTempo: number = 72
): TransitionResult {
  // Limpiar tonalidades
  const cleanSource = sourceKey.replace(/m$/, '');
  const isSourceMinor = sourceKey.endsWith('m');
  const cleanTarget = targetKey.replace(/m$/, '');
  const isTargetMinor = targetKey.endsWith('m');

  const idxSource = CHROMATIC_SHARPS.indexOf(cleanSource) !== -1 
    ? CHROMATIC_SHARPS.indexOf(cleanSource) 
    : CHROMATIC_FLATS.indexOf(cleanSource);

  const idxTarget = CHROMATIC_SHARPS.indexOf(cleanTarget) !== -1 
    ? CHROMATIC_SHARPS.indexOf(cleanTarget) 
    : CHROMATIC_FLATS.indexOf(cleanTarget);

  const semitones = ((idxTarget - idxSource) % 12 + 12) % 12;
  const intervalName = INTERVAL_NAMES[semitones] || `${semitones} semitonos`;

  // Calcular la dominante secundaria de la tonalidad de destino (V7 de Target)
  const targetDominantRoot = CHROMATIC_SHARPS[(idxTarget + 7) % 12];
  const targetDominant = `${targetDominantRoot}7`;
  const targetDominantSus4 = `${targetDominantRoot}7sus4`;

  // Calcular el II grado menor de la tonalidad de destino (IIm7 de Target)
  const targetIIRoot = CHROMATIC_SHARPS[(idxTarget + 2) % 12];
  const targetII = `${targetIIRoot}m7`;

  let transitionType = 'Cadencia Dominante Secundaria (V7)';
  let chordsSequence: string[] = [];
  let steps: TransitionStep[] = [];

  if (semitones === 0 && isSourceMinor === isTargetMinor) {
    transitionType = 'Sin Modulación (Misma Tonalidad)';
    chordsSequence = [sourceKey];
    steps = [
      {
        chord: sourceKey,
        durationBeats: 4,
        explanation: 'Mantén el acorde y deja flotar el pad ambiental.',
        role: 'sustain'
      }
    ];
  } else if (semitones === 2) {
    // Subida clásica de alabanza de 1 tono (ej. C -> D, o G -> A)
    transitionType = 'Elevación de Tono Triunfal (+1 tono)';
    chordsSequence = [sourceKey, targetDominantSus4, targetDominant, targetKey];
    steps = [
      {
        chord: sourceKey,
        durationBeats: 4,
        explanation: 'Termina la última frase de la canción anterior sosteniendo el acorde.',
        role: 'sustain'
      },
      {
        chord: targetDominantSus4,
        durationBeats: 2,
        explanation: 'Toca el acorde suspendido para abrir tensión sin chocar.',
        role: 'dominant'
      },
      {
        chord: targetDominant,
        durationBeats: 2,
        explanation: 'Resuelve la suspensión hacia la dominante que jala al nuevo tono.',
        role: 'dominant'
      },
      {
        chord: targetKey,
        durationBeats: 4,
        explanation: 'Entrada triunfal con la banda en la nueva canción.',
        role: 'resolution'
      }
    ];
  } else if (semitones === 1) {
    // Medio tono arriba (ej. D -> Eb, o G -> Ab)
    transitionType = 'Modulación Exaltada por Semitono (+1/2 tono)';
    chordsSequence = [sourceKey, targetDominant, targetKey];
    steps = [
      {
        chord: sourceKey,
        durationBeats: 4,
        explanation: 'Sostén la tónica en fade out.',
        role: 'sustain'
      },
      {
        chord: targetDominant,
        durationBeats: 4,
        explanation: `Toca ${targetDominant} con fuerza para elevar la expectativa de la congregación.`,
        role: 'dominant'
      },
      {
        chord: targetKey,
        durationBeats: 4,
        explanation: `Aterriza directamente en ${targetKey}.`,
        role: 'resolution'
      }
    ];
  } else if (semitones === 7 || semitones === 5) {
    // Quintas o cuartas (vecinos del círculo de quintas, ej. G -> D, o C -> F)
    transitionType = 'Transición Suave por Círculo de Quintas';
    chordsSequence = [sourceKey, targetII, targetDominant, targetKey];
    steps = [
      {
        chord: sourceKey,
        durationBeats: 4,
        explanation: 'Conexión natural armónica directa.',
        role: 'sustain'
      },
      {
        chord: targetII,
        durationBeats: 2,
        explanation: `Paso al segundo grado relativo (${targetII}).`,
        role: 'pivot'
      },
      {
        chord: targetDominant,
        durationBeats: 2,
        explanation: `Tensión dominante (${targetDominant}).`,
        role: 'dominant'
      },
      {
        chord: targetKey,
        durationBeats: 4,
        explanation: `Entrada a ${targetKey}.`,
        role: 'resolution'
      }
    ];
  } else {
    // Tonalidades distantes (ej. G -> E, o C -> Bb)
    transitionType = 'Cadencia Expandida II-V-I con Acorde Pivote';
    chordsSequence = [sourceKey, `${cleanSource}/D`, targetII, targetDominant, targetKey];
    steps = [
      {
        chord: sourceKey,
        durationBeats: 4,
        explanation: 'Deja apagar la melodía anterior.',
        role: 'sustain'
      },
      {
        chord: targetII,
        durationBeats: 4,
        explanation: `Prepara el nuevo centro tonal introduciendo ${targetII}.`,
        role: 'pivot'
      },
      {
        chord: targetDominant,
        durationBeats: 4,
        explanation: `Resuelve en la dominante ${targetDominant}.`,
        role: 'dominant'
      },
      {
        chord: targetKey,
        durationBeats: 4,
        explanation: `Nueva tonalidad ${targetKey} establecida firmemente.`,
        role: 'resolution'
      }
    ];
  }

  // Generar consejos personalizados por instrumento
  const tempoDiff = targetTempo - sourceTempo;
  let tempoAdvice = '';
  if (Math.abs(tempoDiff) <= 5) {
    tempoAdvice = `El tempo se mantiene prácticamente idéntico (${sourceTempo} BPM → ${targetTempo} BPM).`;
  } else if (tempoDiff > 25) {
    tempoAdvice = `Subida enérgica de tempo (+${tempoDiff} BPM). Haz un calderón (parada sostenida) antes de que la batería marque las 4 baquetas en ${targetTempo} BPM.`;
  } else if (tempoDiff < -25) {
    tempoAdvice = `Transición de júbilo a adoración íntima (${sourceTempo} BPM → ${targetTempo} BPM). Desacelera (ritardando) gradualmente en los últimos 2 compases.`;
  } else {
    tempoAdvice = `Ajusta el tempo con naturalidad de ${sourceTempo} a ${targetTempo} BPM durante la resolución.`;
  }

  const keyboardAdvice = `Mantén el Pad continuo de fondo. En el compás de transición, toca la progresión: ${chordsSequence.join(' ➔ ')}. Usa inversiones cerradas en la mano derecha para que el movimiento de voces sea suave.`;
  
  const guitarAdvice = `Pasa de rasgueo completo a arpegios limpios con chorus o delay en corchea con puntillo. En el acorde ${chordsSequence[chordsSequence.length - 2] || targetDominant}, marca un acorde abierto y silencia cuerdas antes de la entrada.`;
  
  const drumsAdvice = `${tempoAdvice} En el acorde previo a la entrada, realiza un redoble suave en la caja o crash con crescendo, y marca 4 toques limpios de baquetas (hi-hat) en ${targetTempo} BPM.`;
  
  const bassAdvice = `Toca notas largas fundamentales. Haz una línea caminante en el último compás conectando la nota previa con ${cleanTarget}.`;
  
  const worshipLeaderAdvice = `Aprovecha la transición armónica para orar, citar un versículo bíblico o invitar a la congregación a levantar sus manos mientras la armonía modula a ${targetKey}.`;

  return {
    sourceKey,
    targetKey,
    sourceTempo,
    targetTempo,
    intervalName,
    transitionType,
    chordsSequence,
    steps,
    keyboardAdvice,
    guitarAdvice,
    drumsAdvice,
    bassAdvice,
    worshipLeaderAdvice
  };
}
