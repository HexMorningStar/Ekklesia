/**
 * Glosario de Términos Musicales Bíblicos y Guía Litúrgica por Momentos del Culto
 */

export interface LiturgicalMoment {
  id: string;
  name: string;
  emoji: string;
  description: string;
  recommendedTone: string;
  dynamicNote: string;
  passages: Array<{
    book: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
    reference: string;
    label: string;
  }>;
}

export interface HebrewWorshipTerm {
  hebrew: string;
  transliteration: string;
  strongNumber: string;
  meaning: string;
  biblicalExample: string;
  musicalApplication: string;
}

export const LITURGICAL_MOMENTS: LiturgicalMoment[] = [
  {
    id: 'jubilo',
    name: 'Apertura y Júbilo',
    emoji: '🎺',
    description: 'Cánticos de bienvenida, celebración y llamado a toda la congregación a exaltar al Creador.',
    recommendedTone: 'G, D, E mayor (Tempo rápido: 115-135 BPM)',
    dynamicNote: 'Ritmo enérgico, palmas, batería activa y vientos/guitarras alegres.',
    passages: [
      { book: 'Salmos', chapter: 100, verseStart: 1, verseEnd: 5, reference: 'Salmos 100:1-5', label: 'Entrad por sus puertas con acción de gracias' },
      { book: 'Salmos', chapter: 150, verseStart: 1, verseEnd: 6, reference: 'Salmos 150:1-6', label: 'Todo lo que respira alabe a JAH' },
      { book: 'Salmos', chapter: 95, verseStart: 1, verseEnd: 3, reference: 'Salmos 95:1-3', label: 'Venid, cantemos con júbilo a Jehová' },
      { book: 'Salmos', chapter: 149, verseStart: 1, verseEnd: 3, reference: 'Salmos 149:1-3', label: 'Canten a Jehová cántico nuevo' }
    ]
  },
  {
    id: 'adoracion',
    name: 'Adoración Íntima y Reverencia',
    emoji: '🕊️',
    description: 'Tiempo de quebrantamiento, rendición y encuentro personal ante la majestad de Dios.',
    recommendedTone: 'C, D, G, Bm (Tempo lento: 62-72 BPM)',
    dynamicNote: 'Pianos acústicos, pads envolventes, dinámicas sutiles y espacios para cántico espontáneo.',
    passages: [
      { book: 'Salmos', chapter: 63, verseStart: 1, verseEnd: 5, reference: 'Salmos 63:1-5', label: 'Dios, Dios mío eres tú; de madrugada te buscaré' },
      { book: 'Salmos', chapter: 23, verseStart: 1, verseEnd: 6, reference: 'Salmos 23:1-6', label: 'Jehová es mi pastor, nada me faltará' },
      { book: 'Juan', chapter: 4, verseStart: 23, verseEnd: 24, reference: 'Juan 4:23-24', label: 'Adorar al Padre en espíritu y en verdad' },
      { book: 'Isaías', chapter: 6, verseStart: 1, verseEnd: 4, reference: 'Isaías 6:1-4', label: 'Santo, Santo, Santo, Jehová de los ejércitos' },
      { book: 'Salmos', chapter: 51, verseStart: 10, verseEnd: 12, reference: 'Salmos 51:10-12', label: 'Crea en mí, oh Dios, un corazón limpio' }
    ]
  },
  {
    id: 'santa_cena',
    name: 'Santa Cena y Comunión',
    emoji: '🍷',
    description: 'Conmemoración del sacrificio del Cordero de Dios en la cruz, el pan y el cáliz.',
    recommendedTone: 'D, Em, A (Tempo suave y meditativo: 60-68 BPM)',
    dynamicNote: 'Mantener volumen contenido que permita la oración silenciosa y la reflexión del creyente.',
    passages: [
      { book: '1 Corintios', chapter: 11, verseStart: 23, verseEnd: 26, reference: '1 Corintios 11:23-26', label: 'Haced esto en memoria de mí' },
      { book: 'Isaías', chapter: 53, verseStart: 4, verseEnd: 6, reference: 'Isaías 53:4-6', label: 'Herido fue por nuestras rebeliones' },
      { book: 'Mateo', chapter: 26, verseStart: 26, verseEnd: 28, reference: 'Mateo 26:26-28', label: 'Esta es mi sangre del nuevo pacto' },
      { book: 'Filipenses', chapter: 2, verseStart: 8, verseEnd: 11, reference: 'Filipenses 2:8-11', label: 'Se humilló a sí mismo hasta la muerte de cruz' }
    ]
  },
  {
    id: 'ofrenda',
    name: 'Diezmos y Ofrendas',
    emoji: '🌾',
    description: 'Acto de fe, gratitud y generosidad hacia la obra de Dios con regocijo.',
    recommendedTone: 'A, D, G mayor (Tempo moderado y alegre: 95-110 BPM)',
    dynamicNote: 'Música alegre y festiva que inspire gratitud.',
    passages: [
      { book: '2 Corintios', chapter: 9, verseStart: 6, verseEnd: 8, reference: '2 Corintios 9:6-8', label: 'Dios ama al dador alegre' },
      { book: 'Malaquías', chapter: 3, verseStart: 10, verseEnd: 10, reference: 'Malaquías 3:10', label: 'Traed todos los diezmos al alfolí' },
      { book: 'Lucas', chapter: 6, verseStart: 38, verseEnd: 38, reference: 'Lucas 6:38', label: 'Dad, y se os dará; medida buena, apretada y remecida' },
      { book: '1 Crónicas', chapter: 29, verseStart: 11, verseEnd: 14, reference: '1 Crónicas 29:11-14', label: 'Todo es tuyo, y de lo recibido de tu mano te damos' }
    ]
  },
  {
    id: 'altar',
    name: 'Llamado al Altar y Entrega',
    emoji: '⚡',
    description: 'Momento de respuesta a la palabra de Dios, conversión, sanidad y oración de fe.',
    recommendedTone: 'G, C, D, Em (Tempo suave pero creciente)',
    dynamicNote: 'Construir gradualmente la intensidad a medida que las personas se acercan a orar.',
    passages: [
      { book: 'Isaías', chapter: 55, verseStart: 1, verseEnd: 3, reference: 'Isaías 55:1-3', label: 'Venid a las aguas; y los que no tienen dinero, venid y comed' },
      { book: 'Mateo', chapter: 11, verseStart: 28, verseEnd: 30, reference: 'Mateo 11:28-30', label: 'Venid a mí todos los que estáis trabajados y cargados' },
      { book: 'Romanos', chapter: 10, verseStart: 9, verseEnd: 10, reference: 'Romanos 10:9-10', label: 'Si confesares con tu boca que Jesús es el Señor' },
      { book: 'Apocalipsis', chapter: 3, verseStart: 20, verseEnd: 20, reference: 'Apocalipsis 3:20', label: 'He aquí, yo estoy a la puerta y llamo' }
    ]
  }
];

export const HEBREW_WORSHIP_TERMS: HebrewWorshipTerm[] = [
  {
    hebrew: 'סֶלָה',
    transliteration: 'Selah',
    strongNumber: 'H5542',
    meaning: 'Pausa musical reflexiva para meditar profundamente en lo que se acaba de cantar o tocar.',
    biblicalExample: 'Aparece 71 veces en los Salmos (ej. Salmo 3:2, Salmo 46:3).',
    musicalApplication: 'Dejar que los instrumentos bajen a un pad suave o cesen por unos compases para que la congregación asimile la verdad cantada.'
  },
  {
    hebrew: 'תְּהִלָּה',
    transliteration: 'Tehillah',
    strongNumber: 'H8416',
    meaning: 'Cántico espontáneo de alabanza que brota del corazón; un himno nuevo improvisado.',
    biblicalExample: 'Salmo 22:3: "Pero tú eres santo, tú que habitas entre las alabanzas (Tehillah) de Israel."',
    musicalApplication: 'Flujo libre o cántico nuevo durante un puente instrumental, donde el director y la congregación cantan melodías espontáneas.'
  },
  {
    hebrew: 'יָדָה',
    transliteration: 'Yadah',
    strongNumber: 'H3034',
    meaning: 'Alabar con las manos extendidas o levantadas en señal de reverencia y entrega.',
    biblicalExample: 'Salmo 134:2: "Alzad vuestras manos al santuario, y bendecid a Jehová."',
    musicalApplication: 'Momento donde el director invita al pueblo a levantar sus manos al cielo en adoración pura.'
  },
  {
    hebrew: 'הָלַל',
    transliteration: 'Halal (raíz de Aleluya)',
    strongNumber: 'H1984',
    meaning: 'Celebrar ruidosamente, jactarse de Dios con júbilo y regocijo desbordante.',
    biblicalExample: 'Salmo 113:1: "Alabad (Halal), siervos de Jehová, alabad el nombre de Jehová."',
    musicalApplication: 'Canciones rápidas con palmas, grito de júbilo y danzas de regocijo en el templo.'
  },
  {
    hebrew: 'זָמַר',
    transliteration: 'Zamar',
    strongNumber: 'H2167',
    meaning: 'Tocar las cuerdas de un instrumento musical mientras se canta alabanza a Dios.',
    biblicalExample: 'Salmo 144:9: "Oh Dios, a ti cantaré cántico nuevo; con salterio, con decacordio cantaré a ti (Zamar)."',
    musicalApplication: 'Solos de guitarra, arpegios o arreglos instrumentales ejecutados para la gloria de Dios.'
  },
  {
    hebrew: 'שָׁבַח',
    transliteration: 'Shabach',
    strongNumber: 'H7623',
    meaning: 'Clamar en voz alta, exclamar con tono triunfante y voz de victoria.',
    biblicalExample: 'Salmo 63:3: "Porque mejor es tu misericordia que la vida; mis labios te alabarán (Shabach)."',
    musicalApplication: 'El crescendo final de una canción donde toda la congregación clama unánime con voz fuerte.'
  },
  {
    hebrew: 'בָּרַךְ',
    transliteration: 'Barak',
    strongNumber: 'H1288',
    meaning: 'Arrodillarse o postrarse en humilde adoración ante el Señor.',
    biblicalExample: 'Salmo 95:6: "Venid, adoremos y postrémonos; arrodillémonos (Barak) delante de Jehová nuestro Hacedor."',
    musicalApplication: 'Momentos solemnes del servicio donde los músicos bajan a tonos menores o dinámicas de rodillas.'
  },
  {
    hebrew: 'שֹׁופָר',
    transliteration: 'Shofar',
    strongNumber: 'H7782',
    meaning: 'Cuerno de carnero utilizado para convocar al pueblo, declarar la victoria de Dios y anunciar los tiempos sagrados.',
    biblicalExample: 'Salmo 150:3: "Alabadle a son de bocina (Shofar)."',
    musicalApplication: 'Señal de apertura y proclamación de la presencia de Dios en cultos solemnes y congresos.'
  }
];
