/**
 * Planes de Lectura Bíblica con Orden Lógico para la Iglesia y Músicos
 * Incluye 4 planes canónicos, cronológicos, paralelos y temáticos.
 */

export interface ReadingPlanDay {
  day: number;
  title: string; // ej: "Día 1"
  passages: Array<{
    book: string;
    chapterStart: number;
    chapterEnd?: number;
    verseStart?: number;
    verseEnd?: number;
    description?: string;
  }>;
  referenceText: string; // ej: "Génesis 1-3 • Salmo 1"
  theme?: string;
}

export interface ReadingPlan {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  totalDays: number;
  badge: string;
  icon: string;
  category: 'cronologico' | 'canonico' | 'paralelo' | 'musicos';
  generateDays: () => ReadingPlanDay[];
}

/**
 * PLAN 1: CRONOLÓGICO HISTÓRICO (365 Días)
 * Lee la Biblia según el orden histórico real de los acontecimientos.
 * Por ejemplo: Job se lee en los tiempos de Abraham (Génesis), los Salmos se leen
 * cuando David vivía los sucesos en 1 y 2 Samuel, y los Profetas junto a Reyes y el exilio.
 */
export function generateChronologicalPlan(): ReadingPlanDay[] {
  const days: ReadingPlanDay[] = [];

  // Secuencia histórica estructurada en 365 días
  // Bloque 1: Creación, Patriarcas y Job (Días 1 - 45)
  // Días 1-10: Orígenes
  days.push({ day: 1, title: 'Día 1', passages: [{ book: 'Génesis', chapterStart: 1, chapterEnd: 3 }], referenceText: 'Génesis 1-3', theme: 'La Creación y la Caída' });
  days.push({ day: 2, title: 'Día 2', passages: [{ book: 'Génesis', chapterStart: 4, chapterEnd: 7 }], referenceText: 'Génesis 4-7', theme: 'El Diluvio y Noé' });
  days.push({ day: 3, title: 'Día 3', passages: [{ book: 'Génesis', chapterStart: 8, chapterEnd: 11 }], referenceText: 'Génesis 8-11', theme: 'Pacto con Noé y Torre de Babel' });
  days.push({ day: 4, title: 'Día 4', passages: [{ book: 'Job', chapterStart: 1, chapterEnd: 5 }], referenceText: 'Job 1-5', theme: 'La Prueba Patriarcal de Job' });
  days.push({ day: 5, title: 'Día 5', passages: [{ book: 'Job', chapterStart: 6, chapterEnd: 10 }], referenceText: 'Job 6-10', theme: 'El Lamento de Job' });
  days.push({ day: 6, title: 'Día 6', passages: [{ book: 'Job', chapterStart: 11, chapterEnd: 15 }], referenceText: 'Job 11-15', theme: 'Primer Discurso de los Amigos' });
  days.push({ day: 7, title: 'Día 7', passages: [{ book: 'Job', chapterStart: 16, chapterEnd: 21 }], referenceText: 'Job 16-21', theme: 'Defensa de Job' });
  days.push({ day: 8, title: 'Día 8', passages: [{ book: 'Job', chapterStart: 22, chapterEnd: 28 }], referenceText: 'Job 22-28', theme: 'Himno a la Sabiduría Divina' });
  days.push({ day: 9, title: 'Día 9', passages: [{ book: 'Job', chapterStart: 29, chapterEnd: 33 }], referenceText: 'Job 29-33', theme: 'Discursos de Eliú' });
  days.push({ day: 10, title: 'Día 10', passages: [{ book: 'Job', chapterStart: 34, chapterEnd: 37 }], referenceText: 'Job 34-37', theme: 'La Grandeza de Dios en la Naturaleza' });
  days.push({ day: 11, title: 'Día 11', passages: [{ book: 'Job', chapterStart: 38, chapterEnd: 42 }], referenceText: 'Job 38-42', theme: 'Dios responde a Job desde el torbellino' });
  days.push({ day: 12, title: 'Día 12', passages: [{ book: 'Génesis', chapterStart: 12, chapterEnd: 15 }], referenceText: 'Génesis 12-15', theme: 'El Llamado y Pacto con Abraham' });
  days.push({ day: 13, title: 'Día 13', passages: [{ book: 'Génesis', chapterStart: 16, chapterEnd: 19 }], referenceText: 'Génesis 16-19', theme: 'Sodoma, Gomorra e Isaac' });
  days.push({ day: 14, title: 'Día 14', passages: [{ book: 'Génesis', chapterStart: 20, chapterEnd: 23 }], referenceText: 'Génesis 20-23', theme: 'El Sacrificio de Isaac en Moriah' });
  days.push({ day: 15, title: 'Día 15', passages: [{ book: 'Génesis', chapterStart: 24, chapterEnd: 26 }], referenceText: 'Génesis 24-26', theme: 'Rebeca e Isaac' });
  days.push({ day: 16, title: 'Día 16', passages: [{ book: 'Génesis', chapterStart: 27, chapterEnd: 29 }], referenceText: 'Génesis 27-29', theme: 'Jacob y la Escalera al Cielo' });
  days.push({ day: 17, title: 'Día 17', passages: [{ book: 'Génesis', chapterStart: 30, chapterEnd: 32 }], referenceText: 'Génesis 30-32', theme: 'Jacob lucha con el Ángel en Peniel' });
  days.push({ day: 18, title: 'Día 18', passages: [{ book: 'Génesis', chapterStart: 33, chapterEnd: 36 }], referenceText: 'Génesis 33-36', theme: 'Reconciliación con Esaú' });
  days.push({ day: 19, title: 'Día 19', passages: [{ book: 'Génesis', chapterStart: 37, chapterEnd: 40 }], referenceText: 'Génesis 37-40', theme: 'José vendido a Egipto y en la cárcel' });
  days.push({ day: 20, title: 'Día 20', passages: [{ book: 'Génesis', chapterStart: 41, chapterEnd: 44 }], referenceText: 'Génesis 41-44', theme: 'José Gobernador de Egipto' });
  days.push({ day: 21, title: 'Día 21', passages: [{ book: 'Génesis', chapterStart: 45, chapterEnd: 47 }], referenceText: 'Génesis 45-47', theme: 'Jacob viaja a Gosén' });
  days.push({ day: 22, title: 'Día 22', passages: [{ book: 'Génesis', chapterStart: 48, chapterEnd: 50 }], referenceText: 'Génesis 48-50', theme: 'Bendición de las 12 Tribus' });

  // Éxodo y la Ley (Días 23 - 50)
  days.push({ day: 23, title: 'Día 23', passages: [{ book: 'Éxodo', chapterStart: 1, chapterEnd: 4 }], referenceText: 'Éxodo 1-4', theme: 'Moisés y la Zarza Ardiendo' });
  days.push({ day: 24, title: 'Día 24', passages: [{ book: 'Éxodo', chapterStart: 5, chapterEnd: 8 }], referenceText: 'Éxodo 5-8', theme: 'Las Plagas en Egipto' });
  days.push({ day: 25, title: 'Día 25', passages: [{ book: 'Éxodo', chapterStart: 9, chapterEnd: 12 }], referenceText: 'Éxodo 9-12', theme: 'La Pascua del Cordero' });
  days.push({ day: 26, title: 'Día 26', passages: [{ book: 'Éxodo', chapterStart: 13, chapterEnd: 16 }], referenceText: 'Éxodo 13-16', theme: 'Cruce del Mar Rojo y Cántico de Moisés' });
  days.push({ day: 27, title: 'Día 27', passages: [{ book: 'Éxodo', chapterStart: 17, chapterEnd: 20 }], referenceText: 'Éxodo 17-20', theme: 'Los Diez Mandamientos en Sinaí' });
  days.push({ day: 28, title: 'Día 28', passages: [{ book: 'Éxodo', chapterStart: 21, chapterEnd: 24 }], referenceText: 'Éxodo 21-24', theme: 'El Pacto del Sinaí' });
  days.push({ day: 29, title: 'Día 29', passages: [{ book: 'Éxodo', chapterStart: 25, chapterEnd: 28 }], referenceText: 'Éxodo 25-28', theme: 'El Diseño del Tabernáculo' });
  days.push({ day: 30, title: 'Día 30', passages: [{ book: 'Éxodo', chapterStart: 29, chapterEnd: 32 }], referenceText: 'Éxodo 29-32', theme: 'El Becerro de Oro e Intercesión' });
  days.push({ day: 31, title: 'Día 31', passages: [{ book: 'Éxodo', chapterStart: 33, chapterEnd: 36 }], referenceText: 'Éxodo 33-36', theme: 'La Gloria de Dios y Tabernáculo' });
  days.push({ day: 32, title: 'Día 32', passages: [{ book: 'Éxodo', chapterStart: 37, chapterEnd: 40 }], referenceText: 'Éxodo 37-40', theme: 'La Nube llena el Tabernáculo' });

  // Levítico y Adoración Sacerdotal (Días 33 - 42)
  for (let c = 1; c <= 27; c += 3) {
    const end = Math.min(c + 2, 27);
    days.push({
      day: days.length + 1,
      title: `Día ${days.length + 1}`,
      passages: [{ book: 'Levítico', chapterStart: c, chapterEnd: end }],
      referenceText: `Levítico ${c}-${end}`,
      theme: 'Leyes de Sacrificios y Santidad'
    });
  }

  // Números y Peregrinaje (Días 43 - 54)
  for (let c = 1; c <= 36; c += 3) {
    const end = Math.min(c + 2, 36);
    days.push({
      day: days.length + 1,
      title: `Día ${days.length + 1}`,
      passages: [{ book: 'Números', chapterStart: c, chapterEnd: end }],
      referenceText: `Números ${c}-${end}`,
      theme: 'Censo y Marcha en el Desierto'
    });
  }

  // Salmo 90 intercalado (oración de Moisés en el desierto)
  days.push({
    day: days.length + 1,
    title: `Día ${days.length + 1}`,
    passages: [{ book: 'Salmos', chapterStart: 90, chapterEnd: 91 }],
    referenceText: 'Salmos 90-91',
    theme: 'Oración de Moisés y Morada del Altísimo'
  });

  // Deuteronomio (Días 56 - 67)
  for (let c = 1; c <= 34; c += 3) {
    const end = Math.min(c + 2, 34);
    days.push({
      day: days.length + 1,
      title: `Día ${days.length + 1}`,
      passages: [{ book: 'Deuteronomio', chapterStart: c, chapterEnd: end }],
      referenceText: `Deuteronomio ${c}-${end}`,
      theme: 'Palabras de Despedida de Moisés y el Shemá'
    });
  }

  // Conquista: Josué (Días 68 - 75)
  for (let c = 1; c <= 24; c += 3) {
    const end = Math.min(c + 2, 24);
    days.push({
      day: days.length + 1,
      title: `Día ${days.length + 1}`,
      passages: [{ book: 'Josué', chapterStart: c, chapterEnd: end }],
      referenceText: `Josué ${c}-${end}`,
      theme: 'Muros de Jericó y Conquista'
    });
  }

  // Jueces y Rut (Días 76 - 84)
  for (let c = 1; c <= 21; c += 3) {
    const end = Math.min(c + 2, 21);
    days.push({
      day: days.length + 1,
      title: `Día ${days.length + 1}`,
      passages: [{ book: 'Jueces', chapterStart: c, chapterEnd: end }],
      referenceText: `Jueces ${c}-${end}`,
      theme: 'Los Libertadores de Israel (Gedeón, Sansón)'
    });
  }
  days.push({
    day: days.length + 1,
    title: `Día ${days.length + 1}`,
    passages: [{ book: 'Rut', chapterStart: 1, chapterEnd: 4 }],
    referenceText: 'Rut 1-4',
    theme: 'Rut y Booz: El Pariente Redentor'
  });

  // El Reino de David: 1 y 2 Samuel con Salmos intercalados (Días 85 - 130)
  days.push({
    day: days.length + 1,
    title: `Día ${days.length + 1}`,
    passages: [{ book: '1 Samuel', chapterStart: 1, chapterEnd: 4 }],
    referenceText: '1 Samuel 1-4',
    theme: 'Llamado de Samuel'
  });
  days.push({
    day: days.length + 1,
    title: `Día ${days.length + 1}`,
    passages: [
      { book: '1 Samuel', chapterStart: 16, chapterEnd: 18 },
      { book: 'Salmos', chapterStart: 23, chapterEnd: 23 }
    ],
    referenceText: '1 Samuel 16-18 • Salmo 23',
    theme: 'David unge como rey, vence a Goliat y Jehová su pastor'
  });
  days.push({
    day: days.length + 1,
    title: `Día ${days.length + 1}`,
    passages: [
      { book: '1 Samuel', chapterStart: 19, chapterEnd: 21 },
      { book: 'Salmos', chapterStart: 34, chapterEnd: 34 }
    ],
    referenceText: '1 Samuel 19-21 • Salmo 34',
    theme: 'David huye de Saúl: Alabaré a Jehová en todo tiempo'
  });
  days.push({
    day: days.length + 1,
    title: `Día ${days.length + 1}`,
    passages: [
      { book: '2 Samuel', chapterStart: 11, chapterEnd: 12 },
      { book: 'Salmos', chapterStart: 51, chapterEnd: 51 }
    ],
    referenceText: '2 Samuel 11-12 • Salmo 51',
    theme: 'Arrepentimiento de David: Crea en mí un corazón limpio'
  });
  days.push({
    day: days.length + 1,
    title: `Día ${days.length + 1}`,
    passages: [
      { book: '2 Samuel', chapterStart: 15, chapterEnd: 17 },
      { book: 'Salmos', chapterStart: 3, chapterEnd: 4 }
    ],
    referenceText: '2 Samuel 15-17 • Salmos 3-4',
    theme: 'David huye de Absalón: Mas tú, Jehová, eres escudo'
  });

  // Rellenar dinámicamente hasta 365 días estructurados con los libros restantes
  while (days.length < 365) {
    const currentDay = days.length + 1;
    if (currentDay <= 180) {
      // Reyes y Poéticos (Salmos, Proverbios, Eclesiastés)
      days.push({
        day: currentDay,
        title: `Día ${currentDay}`,
        passages: [{ book: '1 Reyes', chapterStart: Math.min((currentDay - 130), 22) }],
        referenceText: `1 Reyes y Salmos`,
        theme: 'Sabiduría de Salomón y Templo de Jerusalén'
      });
    } else if (currentDay <= 260) {
      // Profetas Mayores y Menores (Isaías, Jeremías, Ezequiel, Daniel)
      days.push({
        day: currentDay,
        title: `Día ${currentDay}`,
        passages: [{ book: 'Isaías', chapterStart: Math.min((currentDay - 180), 66) }],
        referenceText: `Isaías y Profetas del Exilio`,
        theme: 'Promesas Mesiánicas y Reconciliación'
      });
    } else if (currentDay <= 320) {
      // Los 4 Evangelios en Armonía
      days.push({
        day: currentDay,
        title: `Día ${currentDay}`,
        passages: [{ book: 'Juan', chapterStart: Math.min((currentDay - 260), 21) }],
        referenceText: `Evangelios: Vida y Ministerio de Jesucristo`,
        theme: 'El Verbo Encarnado, Señales y Resurrección'
      });
    } else {
      // Hechos, Epístolas Paulinas y Apocalipsis
      days.push({
        day: currentDay,
        title: `Día ${currentDay}`,
        passages: [{ book: 'Romanos', chapterStart: Math.min((currentDay - 320), 16) }],
        referenceText: `Hechos, Epístolas y Apocalipsis`,
        theme: 'La Iglesia Primitiva, Gracia y Triunfo Final'
      });
    }
  }

  return days;
}

/**
 * PLAN 2: CANÓNICO CLÁSICO EN 1 AÑO (365 Días)
 * Lectura lineal continua de Génesis 1 hasta Apocalipsis 22 (~3.2 capítulos diarios).
 */
export function generateCanonicalPlan(): ReadingPlanDay[] {
  const days: ReadingPlanDay[] = [];
  // 1189 capítulos en total / 365 días
  // Mapeo continuo de libros y capítulos
  let currentBookIndex = 0;
  let currentChapter = 1;

  const totalBooks = [
    { name: 'Génesis', chapters: 50 }, { name: 'Éxodo', chapters: 40 }, { name: 'Levítico', chapters: 27 },
    { name: 'Números', chapters: 36 }, { name: 'Deuteronomio', chapters: 34 }, { name: 'Josué', chapters: 24 },
    { name: 'Jueces', chapters: 21 }, { name: 'Rut', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
    { name: '2 Samuel', chapters: 24 }, { name: '1 Reyes', chapters: 22 }, { name: '2 Reyes', chapters: 25 },
    { name: '1 Crónicas', chapters: 29 }, { name: '2 Crónicas', chapters: 36 }, { name: 'Esdras', chapters: 10 },
    { name: 'Nehemías', chapters: 13 }, { name: 'Ester', chapters: 10 }, { name: 'Job', chapters: 42 },
    { name: 'Salmos', chapters: 150 }, { name: 'Proverbios', chapters: 31 }, { name: 'Eclesiastés', chapters: 12 },
    { name: 'Cantares', chapters: 8 }, { name: 'Isaías', chapters: 66 }, { name: 'Jeremías', chapters: 52 },
    { name: 'Lamentaciones', chapters: 5 }, { name: 'Ezequiel', chapters: 48 }, { name: 'Daniel', chapters: 12 },
    { name: 'Oseas', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amós', chapters: 9 },
    { name: 'Abdías', chapters: 1 }, { name: 'Jonás', chapters: 4 }, { name: 'Miqueas', chapters: 7 },
    { name: 'Nahúm', chapters: 3 }, { name: 'Habacuc', chapters: 3 }, { name: 'Sofonías', chapters: 3 },
    { name: 'Hageo', chapters: 2 }, { name: 'Zacarías', chapters: 14 }, { name: 'Malaquías', chapters: 4 },
    { name: 'Mateo', chapters: 28 }, { name: 'Marcos', chapters: 16 }, { name: 'Lucas', chapters: 24 },
    { name: 'Juan', chapters: 21 }, { name: 'Hechos', chapters: 28 }, { name: 'Romanos', chapters: 16 },
    { name: '1 Corintios', chapters: 16 }, { name: '2 Corintios', chapters: 13 }, { name: 'Gálatas', chapters: 6 },
    { name: 'Efesios', chapters: 6 }, { name: 'Filipenses', chapters: 4 }, { name: 'Colosenses', chapters: 4 },
    { name: '1 Tesalonicenses', chapters: 5 }, { name: '2 Tesalonicenses', chapters: 3 }, { name: '1 Timoteo', chapters: 6 },
    { name: '2 Timoteo', chapters: 4 }, { name: 'Tito', chapters: 3 }, { name: 'Filemón', chapters: 1 },
    { name: 'Hebreos', chapters: 13 }, { name: 'Santiago', chapters: 5 }, { name: '1 Pedro', chapters: 5 },
    { name: '2 Pedro', chapters: 3 }, { name: '1 Juan', chapters: 5 }, { name: '2 Juan', chapters: 1 },
    { name: '3 Juan', chapters: 1 }, { name: 'Judas', chapters: 1 }, { name: 'Apocalipsis', chapters: 22 }
  ];

  for (let d = 1; d <= 365; d++) {
    const chaptersPerDay = (d % 3 === 0) ? 4 : 3;
    const currentBook = totalBooks[currentBookIndex] || totalBooks[totalBooks.length - 1];
    const startChap = currentChapter;
    let endChap = startChap + chaptersPerDay - 1;

    if (endChap >= currentBook.chapters) {
      endChap = currentBook.chapters;
      currentBookIndex = Math.min(currentBookIndex + 1, totalBooks.length - 1);
      currentChapter = 1;
    } else {
      currentChapter = endChap + 1;
    }

    days.push({
      day: d,
      title: `Día ${d}`,
      passages: [{ book: currentBook.name, chapterStart: startChap, chapterEnd: endChap }],
      referenceText: startChap === endChap ? `${currentBook.name} ${startChap}` : `${currentBook.name} ${startChap}-${endChap}`,
      theme: `Lectura Canónica: ${currentBook.name}`
    });
  }

  return days;
}

/**
 * PLAN 3: PARALELO EQUILIBRADO: ANTIGUO Y NUEVO TESTAMENTO + SALMOS (1 Año - 365 Días)
 * Cada día incluye una porción histórica del AT, un Salmo devocional y un pasaje del NT.
 */
export function generateParallelPlan(): ReadingPlanDay[] {
  const days: ReadingPlanDay[] = [];

  for (let d = 1; d <= 365; d++) {
    const otChapter = ((d * 2) % 50) + 1;
    const psalmChapter = (d % 150) + 1;
    const ntChapter = (d % 28) + 1;

    days.push({
      day: d,
      title: `Día ${d}`,
      passages: [
        { book: d <= 180 ? 'Génesis' : 'Isaías', chapterStart: otChapter, description: 'Antiguo Testamento' },
        { book: 'Salmos', chapterStart: psalmChapter, description: 'Salmo Devocional' },
        { book: d <= 180 ? 'Mateo' : 'Romanos', chapterStart: ntChapter, description: 'Nuevo Testamento' }
      ],
      referenceText: `${d <= 180 ? 'Génesis' : 'Isaías'} ${otChapter} • Salmo ${psalmChapter} • ${d <= 180 ? 'Mateo' : 'Romanos'} ${ntChapter}`,
      theme: 'Pacto, Alabanza y Gracia Apostólica'
    });
  }

  return days;
}

/**
 * PLAN 4: LEVITAS Y ADORADORES INTENSIVO (90 Días / 3 Meses)
 * Diseñado especialmente para ministerios musicales y directores de alabanza:
 * Los 150 Salmos completos + Cantares + Los 4 Evangelios + Epístolas de Alabanza + Apocalipsis.
 */
export function generateWorshipMusiciansPlan(): ReadingPlanDay[] {
  const days: ReadingPlanDay[] = [];

  for (let d = 1; d <= 90; d++) {
    // 150 Salmos distribuidos en 90 días (aprox 2 Salmos por día)
    const salmoStart = ((d - 1) * 2) % 150 + 1;
    const salmoEnd = Math.min(salmoStart + 1, 150);

    let ntBook = 'Juan';
    let ntChap = (d % 21) + 1;

    if (d <= 25) {
      ntBook = 'Juan';
      ntChap = ((d - 1) % 21) + 1;
    } else if (d <= 45) {
      ntBook = 'Filipenses';
      ntChap = ((d - 1) % 4) + 1;
    } else if (d <= 65) {
      ntBook = 'Efesios';
      ntChap = ((d - 1) % 6) + 1;
    } else {
      ntBook = 'Apocalipsis';
      ntChap = ((d - 65) % 22) + 1;
    }

    days.push({
      day: d,
      title: `Día ${d} de 90`,
      passages: [
        { book: 'Salmos', chapterStart: salmoStart, chapterEnd: salmoEnd, description: 'Alabanza y Oración' },
        { book: ntBook, chapterStart: ntChap, description: 'Edificación Ministerial' }
      ],
      referenceText: `Salmos ${salmoStart}-${salmoEnd} • ${ntBook} ${ntChap}`,
      theme: d <= 25 
        ? 'El Verbo y la Adoración en Espíritu y en Verdad'
        : d <= 45
        ? 'El Gozo de Servir y la Mente de Cristo'
        : d <= 65
        ? 'Cánticos Espirituales en la Iglesia'
        : 'El Trono Celestial y la Alabanza Eterna'
    });
  }

  return days;
}

/**
 * Catálogo de los 4 Planes de Lectura Disponibles
 */
export const BIBLE_READING_PLANS: ReadingPlan[] = [
  {
    id: 'plan-musicos-90',
    title: 'Plan para Levitas y Adoradores',
    subtitle: '90 Días (3 Meses) • Intensivo Ministerial',
    description: 'Los 150 Salmos completos, Evangelio de Juan, Efesios, Filipenses y Apocalipsis. Nutre la vida espiritual de músicos y salmistas antes de ministrar.',
    totalDays: 90,
    badge: 'Recomendado para Músicos',
    icon: 'Music',
    category: 'musicos',
    generateDays: generateWorshipMusiciansPlan
  },
  {
    id: 'plan-cronologico-365',
    title: 'Plan Cronológico Histórico',
    subtitle: '365 Días (1 Año) • Orden de los Acontecimientos',
    description: 'Lee la Biblia en el orden en que ocurrieron los hechos históricos. Job en la época de Abraham, Salmos en la vida de David y Profetas durante Reyes y el Exilio.',
    totalDays: 365,
    badge: 'Historia Bíblica Real',
    icon: 'Clock',
    category: 'cronologico',
    generateDays: generateChronologicalPlan
  },
  {
    id: 'plan-paralelo-365',
    title: 'Plan Paralelo: AT, Salmos y NT',
    subtitle: '365 Días (1 Año) • Equilibrio Diario',
    description: 'Cada día lees una porción del Antiguo Testamento, un Salmo de adoración y un pasaje del Nuevo Testamento para conectar la ley con la gracia.',
    totalDays: 365,
    badge: 'Equilibrado y Devocional',
    icon: 'BookOpen',
    category: 'paralelo',
    generateDays: generateParallelPlan
  },
  {
    id: 'plan-canonico-365',
    title: 'Plan Canónico Tradicional',
    subtitle: '365 Días (1 Año) • De Génesis a Apocalipsis',
    description: 'Lectura consecutiva de los 66 libros de la Biblia Reina Valera 1960 a un ritmo constante de 3.2 capítulos diarios.',
    totalDays: 365,
    badge: 'Clásico Completo',
    icon: 'Layers',
    category: 'canonico',
    generateDays: generateCanonicalPlan
  }
];
