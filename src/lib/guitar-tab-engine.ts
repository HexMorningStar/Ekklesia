/**
 * Motor de Tablaturas de Guitarra y Riffs de Alabanza
 * Parsea tablaturas estándar de 6 cuerdas y sintetiza el audio con Web Audio API.
 */

export interface TabNote {
  stringIdx: number; // 0 = e agudo, 1 = B, 2 = G, 3 = D, 4 = A, 5 = E grave
  fret: number;
  timePosition: number; // columna horizontal en el compás
}

export interface IconicWorshipRiff {
  id: string;
  songTitle: string;
  artist: string;
  originalKey: string;
  tempo: number;
  description: string;
  tabText: string;
}

// Frecuencias base de las 6 cuerdas al aire (Afinación Estándar EADGBE)
export const GUITAR_STRING_BASE_FREQS = [
  329.63, // 0: e (1ra cuerda - aguda)
  246.94, // 1: B (2da cuerda)
  196.00, // 2: G (3ra cuerda)
  146.83, // 3: D (4ta cuerda)
  110.00, // 4: A (5ta cuerda)
  82.41   // 5: E (6ta cuerda - grave)
];

export const GUITAR_STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

/**
 * Calcula la frecuencia de un traste en una cuerda específica
 */
export function getFretFrequency(stringIdx: number, fret: number): number {
  const baseFreq = GUITAR_STRING_BASE_FREQS[stringIdx] || 196.0;
  return baseFreq * Math.pow(2, fret / 12);
}

/**
 * Repertorio de Riffs e Intros Icónicas de Alabanza
 */
export const ICONIC_WORSHIP_RIFFS: IconicWorshipRiff[] = [
  {
    id: 'bondad-de-dios',
    songTitle: 'La Bondad de Dios (Goodness of God)',
    artist: 'Bethel Music / Jenn Johnson',
    originalKey: 'G',
    tempo: 70,
    description: 'Intro melódica de guitarra acústica fingerpicking suave y cálida.',
    tabText: 
`e|-------3-------3-------3-------3---|-------3-------3-------3-------3---|
B|-----0---0---0---0---1---1---1---1-|-----3---3---3---3---1---1---1---1-|
G|---0-------0-------0-------0-------|---0-------0-------0-------0-------|
D|-----------------------------------|-----------------------------------|
A|-------------------3---------------|-------------------3---------------|
E|---3-------------------------------|---3-------------------------------|`
  },
  {
    id: 'hermoso-nombre',
    songTitle: 'Hermoso Nombre (What a Beautiful Name)',
    artist: 'Hillsong Worship',
    originalKey: 'D',
    tempo: 68,
    description: 'Hook principal de guitarra eléctrica con delay en corchea con puntillo.',
    tabText:
`e|-----------------------------------|-----------------------------------|
B|-------10------10------12------10--|-------10------10------7-------7---|
G|---11------11------11------11------|---11------11------7-------7-------|
D|-----------------------------------|-----------------------------------|
A|-----------------------------------|-----------------------------------|
E|-----------------------------------|-----------------------------------|`
  },
  {
    id: 'alaba',
    songTitle: 'Alaba (Praise)',
    artist: 'Elevation Worship',
    originalKey: 'Ab',
    tempo: 128,
    description: 'Riff enérgico y rítmico de alabanza con palm mute y overdrive.',
    tabText:
`e|-----------------------------------|-----------------------------------|
B|-----------------------------------|-----------------------------------|
G|-------1-------1-------1-------1---|-------3-------3-------1-------1---|
D|-----1---1---1---1---1---1---1---1-|-----3---3---3---3---1---1---1---1-|
A|-----------------------------------|---1-------1-----------------------|
E|---4-------4-------4-------4-------|-------------------4-------4-------|`
  },
  {
    id: 'gracia-sublime',
    songTitle: 'Gracia Sublime es Tu Amor',
    artist: 'Phil Wickham',
    originalKey: 'B',
    tempo: 100,
    description: 'Lead signature de guitarra eléctrica con reverb ambiental.',
    tabText:
`e|---7---7---7---7---7---7---7---7---|---9---9---9---9---7---7---7---7---|
B|-----7---7---7---7---7---7---7---7-|-----7---7---7---7---7---7---7---7-|
G|-----------------------------------|-----------------------------------|
D|-----------------------------------|-----------------------------------|
A|-----------------------------------|-----------------------------------|
E|-----------------------------------|-----------------------------------|`
  },
  {
    id: 'rey-de-reyes',
    songTitle: 'Rey de Reyes (King of Kings)',
    artist: 'Hillsong Worship',
    originalKey: 'D',
    tempo: 68,
    description: 'Arpegio de guitarra acústica en Re Mayor.',
    tabText:
`e|---------2---------------2---------|---------0---------------2---------|
B|-------3---3-----------3---3-------|-------3---3-----------3---3-------|
G|-----2-------2-------2-------2-----|-----2-------2-------2-------2-----|
D|---0---------------0---------------|---0---------------0---------------|
A|-----------------------------------|-----------------------------------|
E|-----------------------------------|-----------------------------------|`
  }
];

/**
 * Sintetizador de pulsación de cuerda de guitarra con Web Audio API
 */
export function playGuitarStringPluck(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number = 0.8
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Armónicos ricos de cuerda metálica
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, startTime);

  // Filtro pasa-bajos que emula la resonancia del cuerpo de la guitarra
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 3.5, startTime);
  filter.frequency.exponentialRampToValueAtTime(freq * 1.1, startTime + duration);

  // Envolvente de volumen (ataque instantáneo y caída exponencial)
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(0.25, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}
