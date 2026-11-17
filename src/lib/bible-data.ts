/**
 * Datos y Estructura de la Biblia Reina Valera 1960 (RVR1960)
 * Incluye los 66 libros canónicos, metadata, buscador y referencias cruzadas.
 */

export interface BibleBook {
  id: number;
  name: string;
  testament: 'Antiguo Testamento' | 'Nuevo Testamento';
  genre: string;
  chaptersCount: number;
  abbreviation: string;
}

export interface CrossReference {
  id: string;
  from: {
    book: string;
    chapter: number;
    verse: number;
    verseEnd?: number;
  };
  to: {
    book: string;
    chapter: number;
    verse: number;
    verseEnd?: number;
  };
  note?: string;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

// 66 Libros de la Reina Valera 1960
export const BIBLE_BOOKS: BibleBook[] = [
  // Antiguo Testamento (39 libros)
  { id: 1, name: 'Génesis', testament: 'Antiguo Testamento', genre: 'Pentateuco', chaptersCount: 50, abbreviation: 'Gn' },
  { id: 2, name: 'Éxodo', testament: 'Antiguo Testamento', genre: 'Pentateuco', chaptersCount: 40, abbreviation: 'Ex' },
  { id: 3, name: 'Levítico', testament: 'Antiguo Testamento', genre: 'Pentateuco', chaptersCount: 27, abbreviation: 'Lv' },
  { id: 4, name: 'Números', testament: 'Antiguo Testamento', genre: 'Pentateuco', chaptersCount: 36, abbreviation: 'Nm' },
  { id: 5, name: 'Deuteronomio', testament: 'Antiguo Testamento', genre: 'Pentateuco', chaptersCount: 34, abbreviation: 'Dt' },
  { id: 6, name: 'Josué', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 24, abbreviation: 'Jos' },
  { id: 7, name: 'Jueces', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 21, abbreviation: 'Jue' },
  { id: 8, name: 'Rut', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 4, abbreviation: 'Rt' },
  { id: 9, name: '1 Samuel', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 31, abbreviation: '1S' },
  { id: 10, name: '2 Samuel', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 24, abbreviation: '2S' },
  { id: 11, name: '1 Reyes', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 22, abbreviation: '1R' },
  { id: 12, name: '2 Reyes', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 25, abbreviation: '2R' },
  { id: 13, name: '1 Crónicas', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 29, abbreviation: '1Cr' },
  { id: 14, name: '2 Crónicas', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 36, abbreviation: '2Cr' },
  { id: 15, name: 'Esdras', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 10, abbreviation: 'Esd' },
  { id: 16, name: 'Nehemías', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 13, abbreviation: 'Neh' },
  { id: 17, name: 'Ester', testament: 'Antiguo Testamento', genre: 'Histórico', chaptersCount: 10, abbreviation: 'Est' },
  { id: 18, name: 'Job', testament: 'Antiguo Testamento', genre: 'Poético', chaptersCount: 42, abbreviation: 'Job' },
  { id: 19, name: 'Salmos', testament: 'Antiguo Testamento', genre: 'Poético / Alabanza', chaptersCount: 150, abbreviation: 'Sal' },
  { id: 20, name: 'Proverbios', testament: 'Antiguo Testamento', genre: 'Sapiencial', chaptersCount: 31, abbreviation: 'Pr' },
  { id: 21, name: 'Eclesiastés', testament: 'Antiguo Testamento', genre: 'Sapiencial', chaptersCount: 12, abbreviation: 'Ec' },
  { id: 22, name: 'Cantares', testament: 'Antiguo Testamento', genre: 'Poético', chaptersCount: 8, abbreviation: 'Cnt' },
  { id: 23, name: 'Isaías', testament: 'Antiguo Testamento', genre: 'Profetas Mayores', chaptersCount: 66, abbreviation: 'Is' },
  { id: 24, name: 'Jeremías', testament: 'Antiguo Testamento', genre: 'Profetas Mayores', chaptersCount: 52, abbreviation: 'Jr' },
  { id: 25, name: 'Lamentaciones', testament: 'Antiguo Testamento', genre: 'Profetas Mayores', chaptersCount: 5, abbreviation: 'Lm' },
  { id: 26, name: 'Ezequiel', testament: 'Antiguo Testamento', genre: 'Profetas Mayores', chaptersCount: 48, abbreviation: 'Ez' },
  { id: 27, name: 'Daniel', testament: 'Antiguo Testamento', genre: 'Profetas Mayores', chaptersCount: 12, abbreviation: 'Dn' },
  { id: 28, name: 'Oseas', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 14, abbreviation: 'Os' },
  { id: 29, name: 'Joel', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 3, abbreviation: 'Jl' },
  { id: 30, name: 'Amós', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 9, abbreviation: 'Am' },
  { id: 31, name: 'Abdías', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 1, abbreviation: 'Abd' },
  { id: 32, name: 'Jonás', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 4, abbreviation: 'Jon' },
  { id: 33, name: 'Miqueas', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 7, abbreviation: 'Miq' },
  { id: 34, name: 'Nahúm', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 3, abbreviation: 'Nah' },
  { id: 35, name: 'Habacuc', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 3, abbreviation: 'Hab' },
  { id: 36, name: 'Sofonías', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 3, abbreviation: 'Sof' },
  { id: 37, name: 'Hageo', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 2, abbreviation: 'Hag' },
  { id: 38, name: 'Zacarías', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 14, abbreviation: 'Zac' },
  { id: 39, name: 'Malaquías', testament: 'Antiguo Testamento', genre: 'Profetas Menores', chaptersCount: 4, abbreviation: 'Mal' },

  // Nuevo Testamento (27 libros)
  { id: 40, name: 'Mateo', testament: 'Nuevo Testamento', genre: 'Evangelios', chaptersCount: 28, abbreviation: 'Mt' },
  { id: 41, name: 'Marcos', testament: 'Nuevo Testamento', genre: 'Evangelios', chaptersCount: 16, abbreviation: 'Mc' },
  { id: 42, name: 'Lucas', testament: 'Nuevo Testamento', genre: 'Evangelios', chaptersCount: 24, abbreviation: 'Lc' },
  { id: 43, name: 'Juan', testament: 'Nuevo Testamento', genre: 'Evangelios', chaptersCount: 21, abbreviation: 'Jn' },
  { id: 44, name: 'Hechos', testament: 'Nuevo Testamento', genre: 'Histórico NT', chaptersCount: 28, abbreviation: 'Hch' },
  { id: 45, name: 'Romanos', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 16, abbreviation: 'Ro' },
  { id: 46, name: '1 Corintios', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 16, abbreviation: '1Co' },
  { id: 47, name: '2 Corintios', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 13, abbreviation: '2Co' },
  { id: 48, name: 'Gálatas', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 6, abbreviation: 'Gá' },
  { id: 49, name: 'Efesios', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 6, abbreviation: 'Ef' },
  { id: 50, name: 'Filipenses', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 4, abbreviation: 'Fil' },
  { id: 51, name: 'Colosenses', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 4, abbreviation: 'Col' },
  { id: 52, name: '1 Tesalonicenses', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 5, abbreviation: '1Ts' },
  { id: 53, name: '2 Tesalonicenses', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 3, abbreviation: '2Ts' },
  { id: 54, name: '1 Timoteo', testament: 'Nuevo Testamento', genre: 'Epístolas Pastorales', chaptersCount: 6, abbreviation: '1Ti' },
  { id: 55, name: '2 Timoteo', testament: 'Nuevo Testamento', genre: 'Epístolas Pastorales', chaptersCount: 4, abbreviation: '2Ti' },
  { id: 56, name: 'Tito', testament: 'Nuevo Testamento', genre: 'Epístolas Pastorales', chaptersCount: 3, abbreviation: 'Tit' },
  { id: 57, name: 'Filemón', testament: 'Nuevo Testamento', genre: 'Epístolas Paulinas', chaptersCount: 1, abbreviation: 'Flm' },
  { id: 58, name: 'Hebreos', testament: 'Nuevo Testamento', genre: 'Epístolas Generales', chaptersCount: 13, abbreviation: 'He' },
  { id: 59, name: 'Santiago', testament: 'Nuevo Testamento', genre: 'Epístolas Generales', chaptersCount: 5, abbreviation: 'Stg' },
  { id: 60, name: '1 Pedro', testament: 'Nuevo Testamento', genre: 'Epístolas Generales', chaptersCount: 5, abbreviation: '1P' },
  { id: 61, name: '2 Pedro', testament: 'Nuevo Testamento', genre: 'Epístolas Generales', chaptersCount: 3, abbreviation: '2P' },
  { id: 62, name: '1 Juan', testament: 'Nuevo Testamento', genre: 'Epístolas Generales', chaptersCount: 5, abbreviation: '1Jn' },
  { id: 63, name: '2 Juan', testament: 'Nuevo Testamento', genre: 'Epístolas Generales', chaptersCount: 1, abbreviation: '2Jn' },
  { id: 64, name: '3 Juan', testament: 'Nuevo Testamento', genre: 'Epístolas Generales', chaptersCount: 1, abbreviation: '3Jn' },
  { id: 65, name: 'Judas', testament: 'Nuevo Testamento', genre: 'Epístolas Generales', chaptersCount: 1, abbreviation: 'Jud' },
  { id: 66, name: 'Apocalipsis', testament: 'Nuevo Testamento', genre: 'Profecía', chaptersCount: 22, abbreviation: 'Ap' }
];

// Base canónica de referencias cruzadas esenciales (Treasury of Scripture Knowledge)
export const INITIAL_CROSS_REFERENCES: CrossReference[] = [
  // Conexiones Salmos <-> Éxodo / Génesis
  {
    id: 'cr-sal110-ex24',
    from: { book: 'Salmos', chapter: 110, verse: 1 },
    to: { book: 'Éxodo', chapter: 24, verse: 1, verseEnd: 2 },
    note: 'El Señor exalta al mediador supremo ante el trono divino.'
  },
  {
    id: 'cr-sal110-he1',
    from: { book: 'Salmos', chapter: 110, verse: 1 },
    to: { book: 'Hebreos', chapter: 1, verse: 13 },
    note: 'Cristo sentado a la diestra de Dios Padre.'
  },
  {
    id: 'cr-sal110-mt22',
    from: { book: 'Salmos', chapter: 110, verse: 1 },
    to: { book: 'Mateo', chapter: 22, verse: 44 },
    note: 'Jesús declara ser el Señor de David.'
  },
  {
    id: 'cr-sal22-mt27',
    from: { book: 'Salmos', chapter: 22, verse: 1 },
    to: { book: 'Mateo', chapter: 27, verse: 46 },
    note: 'Cumplimiento profético del clamor de Jesús en la cruz.'
  },
  {
    id: 'cr-sal22-jn19',
    from: { book: 'Salmos', chapter: 22, verse: 18 },
    to: { book: 'Juan', chapter: 19, verse: 23, verseEnd: 24 },
    note: 'Repartición de las vestiduras del Mesías.'
  },
  {
    id: 'cr-sal23-jn10',
    from: { book: 'Salmos', chapter: 23, verse: 1 },
    to: { book: 'Juan', chapter: 10, verse: 11 },
    note: 'Jesús como el Buen Pastor que da su vida por las ovejas.'
  },
  {
    id: 'cr-sal23-ez34',
    from: { book: 'Salmos', chapter: 23, verse: 1 },
    to: { book: 'Ezequiel', chapter: 34, verse: 11, verseEnd: 15 },
    note: 'Dios mismo apacentará a su pueblo.'
  },
  {
    id: 'cr-sal23-ap7',
    from: { book: 'Salmos', chapter: 23, verse: 2 },
    to: { book: 'Apocalipsis', chapter: 7, verse: 17 },
    note: 'El Cordero los pastoreará y los guiará a fuentes de aguas vivas.'
  },
  {
    id: 'cr-sal100-1cr16',
    from: { book: 'Salmos', chapter: 100, verse: 1 },
    to: { book: '1 Crónicas', chapter: 16, verse: 23, verseEnd: 34 },
    note: 'Alabanza y júbilo a Jehová en el tabernáculo de David.'
  },
  {
    id: 'cr-sal100-ef5',
    from: { book: 'Salmos', chapter: 100, verse: 2 },
    to: { book: 'Efesios', chapter: 5, verse: 19 },
    note: 'Alabando de corazón al Señor con salmos e himnos espirituales.'
  },

  // Conexiones Génesis <-> Salmos / Evangelios
  {
    id: 'cr-gn1-jn1',
    from: { book: 'Génesis', chapter: 1, verse: 1 },
    to: { book: 'Juan', chapter: 1, verse: 1, verseEnd: 3 },
    note: 'En el principio: El Verbo eterno como creador de todas las cosas.'
  },
  {
    id: 'cr-gn1-sal102',
    from: { book: 'Génesis', chapter: 1, verse: 1 },
    to: { book: 'Salmos', chapter: 102, verse: 25 },
    note: 'Desde el principio fundaste la tierra y los cielos son obra de tus manos.'
  },
  {
    id: 'cr-gn1-col1',
    from: { book: 'Génesis', chapter: 1, verse: 1 },
    to: { book: 'Colosenses', chapter: 1, verse: 16, verseEnd: 17 },
    note: 'En Cristo fueron creadas todas las cosas en el cielo y en la tierra.'
  },
  {
    id: 'cr-gn3-ro16',
    from: { book: 'Génesis', chapter: 3, verse: 15 },
    to: { book: 'Romanos', chapter: 16, verse: 20 },
    note: 'El Dios de paz aplastará en breve a Satanás bajo vuestros pies.'
  },

  // Conexiones Éxodo <-> Salmos / Evangelios
  {
    id: 'cr-ex3-jn8',
    from: { book: 'Éxodo', chapter: 3, verse: 14 },
    to: { book: 'Juan', chapter: 8, verse: 58 },
    note: 'Jesús proclama: Antes que Abraham fuese, YO SOY.'
  },
  {
    id: 'cr-ex12-1co5',
    from: { book: 'Éxodo', chapter: 12, verse: 5 },
    to: { book: '1 Corintios', chapter: 5, verse: 7 },
    note: 'Nuestra pascua, que es Cristo, ya fue sacrificada por nosotros.'
  },
  {
    id: 'cr-ex12-jn1',
    from: { book: 'Éxodo', chapter: 12, verse: 3 },
    to: { book: 'Juan', chapter: 1, verse: 29 },
    note: 'He aquí el Cordero de Dios que quita el pecado del mundo.'
  },
  {
    id: 'cr-ex20-dt5',
    from: { book: 'Éxodo', chapter: 20, verse: 1 },
    to: { book: 'Deuteronomio', chapter: 5, verse: 6, verseEnd: 21 },
    note: 'Los Diez Mandamientos proclamados al pueblo de Dios.'
  },
  {
    id: 'cr-ex20-mt22',
    from: { book: 'Éxodo', chapter: 20, verse: 3 },
    to: { book: 'Mateo', chapter: 22, verse: 37, verseEnd: 40 },
    note: 'El gran mandamiento: Amarás al Señor tu Dios con todo tu corazón.'
  },

  // Alabanza, Adoración y Vida Cristiana
  {
    id: 'cr-sal150-ap5',
    from: { book: 'Salmos', chapter: 150, verse: 6 },
    to: { book: 'Apocalipsis', chapter: 5, verse: 13 },
    note: 'Toda criatura en el cielo y la tierra adorando al Cordero.'
  },
  {
    id: 'cr-sal150-col3',
    from: { book: 'Salmos', chapter: 150, verse: 1 },
    to: { book: 'Colosenses', chapter: 3, verse: 16 },
    note: 'Cantando con gracia en vuestros corazones al Señor.'
  },
  {
    id: 'cr-sal34-1ts5',
    from: { book: 'Salmos', chapter: 34, verse: 1 },
    to: { book: '1 Tesalonicenses', chapter: 5, verse: 16, verseEnd: 18 },
    note: 'Dad gracias en todo porque esta es la voluntad de Dios en Cristo Jesús.'
  },
  {
    id: 'cr-jn4-flp3',
    from: { book: 'Juan', chapter: 4, verse: 23, verseEnd: 24 },
    to: { book: 'Filipenses', chapter: 3, verse: 3 },
    note: 'Nosotros los que en espíritu servimos a Dios y nos gloriamos en Cristo Jesús.'
  },
  {
    id: 'cr-is53-1p2',
    from: { book: 'Isaías', chapter: 53, verse: 5 },
    to: { book: '1 Pedro', chapter: 2, verse: 24 },
    note: 'Por cuya herida fuisteis sanados.'
  },
  {
    id: 'cr-ro8-jer29',
    from: { book: 'Romanos', chapter: 8, verse: 28 },
    to: { book: 'Jeremías', chapter: 29, verse: 11 },
    note: 'Pensamientos de paz y no de mal para daros el fin que esperáis.'
  },
  {
    id: 'cr-sal91-mt4',
    from: { book: 'Salmos', chapter: 91, verse: 11 },
    to: { book: 'Mateo', chapter: 4, verse: 6 },
    note: 'A sus ángeles mandará cerca de ti (citado en la tentación de Jesús).'
  },
  {
    id: 'cr-sal121-sal124',
    from: { book: 'Salmos', chapter: 121, verse: 2 },
    to: { book: 'Salmos', chapter: 124, verse: 8 },
    note: 'Nuestro socorro está en el nombre de Jehová, que hizo el cielo y la tierra.'
  },
  {
    id: 'cr-1co13-1jn4',
    from: { book: '1 Corintios', chapter: 13, verse: 8 },
    to: { book: '1 Juan', chapter: 4, verse: 8 },
    note: 'El amor nunca deja de ser; el que no ama no ha conocido a Dios, porque Dios es amor.'
  }
];

// Pasajes emblemáticos de la RVR1960 pre-cargados para uso inmediato
export const FAMOUS_PASSAGES: BibleVerse[] = [
  // Génesis 1
  { book: 'Génesis', chapter: 1, verse: 1, text: 'En el principio creó Dios los cielos y la tierra.' },
  { book: 'Génesis', chapter: 1, verse: 2, text: 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.' },
  { book: 'Génesis', chapter: 1, verse: 3, text: 'Y dijo Dios: Sea la luz; y fue la luz.' },
  { book: 'Génesis', chapter: 1, verse: 27, text: 'Y creó Dios al hombre a su imagen, a imagen de Dios lo creó; varón y hembra los creó.' },

  // Éxodo 3
  { book: 'Éxodo', chapter: 3, verse: 14, text: 'Y respondió Dios a Moisés: YO SOY EL QUE SOY. Y dijo: Así dirás a los hijos de Israel: YO SOY me envió a vosotros.' },

  // Éxodo 20
  { book: 'Éxodo', chapter: 20, verse: 1, text: 'Y habló Dios todas estas palabras, diciendo:' },
  { book: 'Éxodo', chapter: 20, verse: 2, text: 'Yo soy Jehová tu Dios, que te saqué de la tierra de Egipto, de casa de servidumbre.' },
  { book: 'Éxodo', chapter: 20, verse: 3, text: 'No tendrás dioses ajenos delante de mí.' },

  // Salmos 23
  { book: 'Salmos', chapter: 23, verse: 1, text: 'Jehová es mi pastor; nada me faltará.' },
  { book: 'Salmos', chapter: 23, verse: 2, text: 'En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará.' },
  { book: 'Salmos', chapter: 23, verse: 3, text: 'Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre.' },
  { book: 'Salmos', chapter: 23, verse: 4, text: 'Aunque ande en valle de sombra de muerte, No temeré mal alguno, porque tú estarás conmigo; Tu vara y tu cayado me infundirán aliento.' },
  { book: 'Salmos', chapter: 23, verse: 5, text: 'Aderezas mesa delante de mí en presencia de mis angustiadores; Unges mi cabeza con aceite; mi copa está rebosando.' },
  { book: 'Salmos', chapter: 23, verse: 6, text: 'Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, Y en la casa de Jehová moraré por largos días.' },

  // Salmos 100
  { book: 'Salmos', chapter: 100, verse: 1, text: 'Cantad alegres a Dios, habitantes de toda la tierra.' },
  { book: 'Salmos', chapter: 100, verse: 2, text: 'Servid a Jehová con alegría; Venid ante su presencia con regocijo.' },
  { book: 'Salmos', chapter: 100, verse: 3, text: 'Reconoced que Jehová es Dios; Él nos hizo, y no nosotros a nosotros mismos; Pueblo suyo somos, y ovejas de su prado.' },
  { book: 'Salmos', chapter: 100, verse: 4, text: 'Entrad por sus puertas con acción de gracias, Por sus atrios con alabanza; Alabadle, bendecid su nombre.' },
  { book: 'Salmos', chapter: 100, verse: 5, text: 'Porque Jehová es bueno; para siempre es su misericordia, Y su verdad por todas las generaciones.' },

  // Salmos 110
  { book: 'Salmos', chapter: 110, verse: 1, text: 'Jehová dijo a mi Señor: Siéntate a mi diestra, Hasta que ponga a tus enemigos por estrado de tus pies.' },
  { book: 'Salmos', chapter: 110, verse: 2, text: 'Jehová enviará desde Sion la vara de tu poder; Domina en medio de tus enemigos.' },

  // Salmos 150
  { book: 'Salmos', chapter: 150, verse: 1, text: 'Alabad a Dios en su santuario; Alabadle en la magnificencia de su firmamento.' },
  { book: 'Salmos', chapter: 150, verse: 2, text: 'Alabadle por sus proezas; Alabadle conforme a la muchedumbre de su grandeza.' },
  { book: 'Salmos', chapter: 150, verse: 3, text: 'Alabadle a son de bocina; Alabadle con salterio y arpa.' },
  { book: 'Salmos', chapter: 150, verse: 4, text: 'Alabadle con pandero y danza; Alabadle con cuerdas y flautas.' },
  { book: 'Salmos', chapter: 150, verse: 5, text: 'Alabadle con címbalos resonantes; Alabadle con címbalos de júbilo.' },
  { book: 'Salmos', chapter: 150, verse: 6, text: 'Todo lo que respira alabe a JAH. Aleluya.' },

  // Juan 1
  { book: 'Juan', chapter: 1, verse: 1, text: 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.' },
  { book: 'Juan', chapter: 1, verse: 2, text: 'Este era en el principio con Dios.' },
  { book: 'Juan', chapter: 1, verse: 3, text: 'Todas las cosas por él fueron hechas, y sin él nada de lo que ha sido hecho, fue hecho.' },
  { book: 'Juan', chapter: 1, verse: 14, text: 'Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.' },

  // Juan 3
  { book: 'Juan', chapter: 3, verse: 16, text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' },

  // Juan 4
  { book: 'Juan', chapter: 4, verse: 23, text: 'Mas la hora viene, y ahora es, cuando los verdaderos adoradores adorarán al Padre en espíritu y en verdad; porque también el Padre tales adoradores busca que le adoren.' },
  { book: 'Juan', chapter: 4, verse: 24, text: 'Dios es Espíritu; y los que le adoran, en espíritu y en verdad es necesario que adoren.' },

  // Salmos 91
  { book: 'Salmos', chapter: 91, verse: 1, text: 'El que habita al abrigo del Altísimo Morará bajo la sombra del Omnipotente.' },
  { book: 'Salmos', chapter: 91, verse: 2, text: 'Diré yo a Jehová: Esperanza mía, y castillo mío; Mi Dios, en quien confiaré.' },
  { book: 'Salmos', chapter: 91, verse: 4, text: 'Con sus plumas te cubrirá, Y debajo de sus alas estarás seguro; Escudo y adarga es su verdad.' },
  { book: 'Salmos', chapter: 91, verse: 11, text: 'Pues a sus ángeles mandará acerca de ti, Que te guarden en todos tus caminos.' },

  // Salmos 121
  { book: 'Salmos', chapter: 121, verse: 1, text: 'Alzaré mis ojos a los montes; ¿De dónde vendrá mi socorro?' },
  { book: 'Salmos', chapter: 121, verse: 2, text: 'Mi socorro viene de Jehová, Que hizo los cielos y la tierra.' },
  { book: 'Salmos', chapter: 121, verse: 8, text: 'Jehová guardará tu salida y tu entrada Desde ahora y para siempre.' },

  // Isaías 40
  { book: 'Isaías', chapter: 40, verse: 29, text: 'Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ningunas.' },
  { book: 'Isaías', chapter: 40, verse: 31, text: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.' },

  // Mateo 28
  { book: 'Mateo', chapter: 28, verse: 19, text: 'Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, y del Hijo, y del Espíritu Santo;' },
  { book: 'Mateo', chapter: 28, verse: 20, text: 'enseñándoles que guarden todas las cosas que os he mandado; y he aquí yo estoy con vosotros todos los días, hasta el fin del mundo. Amén.' },

  // 1 Corintios 13
  { book: '1 Corintios', chapter: 13, verse: 4, text: 'El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece;' },
  { book: '1 Corintios', chapter: 13, verse: 8, text: 'El amor nunca deja de ser; pero las profecías se acabarán, y cesarán las lenguas, y la ciencia acabará.' },
  { book: '1 Corintios', chapter: 13, verse: 13, text: 'Y ahora permanecen la fe, la esperanza y el amor, estos tres; pero el mayor de ellos es el amor.' },

  // Romanos 8
  { book: 'Romanos', chapter: 8, verse: 28, text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.' },

  // Filipenses 4
  { book: 'Filipenses', chapter: 4, verse: 13, text: 'Todo lo puedo en Cristo que me fortalece.' }
];

/**
 * Normaliza nombres de libros para búsquedas flexibles
 * Ej: "salmo" -> "Salmos", "gen" -> "Génesis", "mateo" -> "Mateo"
 */
export function findBookByName(query: string): BibleBook | undefined {
  const clean = query.trim().toLowerCase();
  return BIBLE_BOOKS.find(b => 
    b.name.toLowerCase() === clean ||
    b.abbreviation.toLowerCase() === clean ||
    b.name.toLowerCase().startsWith(clean)
  );
}

/**
 * Parsea una referencia en texto (ej: "Salmos 23:1", "Jn 3:16", "Genesis 1")
 */
export function parseBibleCitation(citation: string): { book: BibleBook; chapter: number; verse?: number } | null {
  const match = citation.trim().match(/^([1-3]?\s*[A-Za-zÁ-ú]+)\s*(\d+)(?::(\d+))?$/);
  if (!match) return null;

  const [, bookRaw, chapterStr, verseStr] = match;
  const book = findBookByName(bookRaw);
  if (!book) return null;

  const chapter = parseInt(chapterStr, 10);
  const verse = verseStr ? parseInt(verseStr, 10) : undefined;

  return { book, chapter, verse };
}
