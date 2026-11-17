import { GoogleGenAI } from '@google/genai';
import { searchLaCuerda, fetchLaCuerdaByUrl } from './lacuerda';

export interface GeminiSongVersion {
  id?: string;
  title: string;
  artist: string;
  versionTitle: string; // Ej: "Versión Álbum 25 Años (En Vivo)", "Versión Oficial LaCuerda.net", "Versión Acústica"
  originalKey: string;
  tempo: number;
  timeSignature: string;
  content: string; // Formateado en ChordPro [G]Dios es [Em]bueno
  scriptureReference: string;
  notes: string;
  previewSnippet?: string;
  source?: 'gemini' | 'lacuerda';
}

export interface GeminiSearchResponse {
  query: string;
  versions: GeminiSongVersion[];
}

export const DEFAULT_GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function searchSongWithGemini(
  query: string,
  userApiKey?: string,
  requestedKey?: string,
  modelPreference: string = 'gemini-3.8-flash'
): Promise<GeminiSongVersion[]> {
  const trimmedQuery = query.trim();

  // 1. Si el usuario ingresó una URL directa de LaCuerda.net
  if (/https?:\/\/(?:acordes\.)?lacuerda\.net\//i.test(trimmedQuery)) {
    const directSong = await fetchLaCuerdaByUrl(trimmedQuery);
    if (directSong) {
      directSong.source = 'lacuerda';
      return [directSong];
    }
  }

  // 2. Si el usuario seleccionó la fuente directa de LaCuerda
  if (modelPreference === 'lacuerda') {
    const lacuerdaResults = await searchLaCuerda(trimmedQuery);
    if (lacuerdaResults.length > 0) {
      return lacuerdaResults.map(v => ({ ...v, source: 'lacuerda' as const }));
    }
  }

  // 3. Buscar en paralelo en LaCuerda para complementar o respaldar a Gemini
  const lacuerdaPromise = searchLaCuerda(trimmedQuery).catch(() => [] as GeminiSongVersion[]);

  const envKey = process.env.GEMINI_API_KEY?.trim() || DEFAULT_GEMINI_API_KEY;
  const customKey = userApiKey?.trim();

  // Claves a intentar: siempre incluye la clave oficial predeterminada de Gemini 3.8
  const keysToTry: string[] = [];
  if (customKey) keysToTry.push(customKey);
  if (envKey && !keysToTry.includes(envKey)) keysToTry.push(envKey);
  if (!keysToTry.includes(DEFAULT_GEMINI_API_KEY)) keysToTry.push(DEFAULT_GEMINI_API_KEY);

  const systemInstruction = `
Eres un maestro de música e himnólogo cristiano especialista en grupos de alabanza y adoración.
Tu tarea es buscar e identificar canciones cristianas solicitadas por músicos de iglesia.

INSTRUCCIONES CLAVE DE IDENTIFICACIÓN:
1. Búsqueda por fragmentos de letra o versos:
   - Si la consulta del usuario contiene estrofas, versos o frases líricas (ejemplo: "solo hay uno que es digno", "un rey que volver nos prometio", "unigenito del padre"):
     DEBES IDENTIFICAR la canción real a la que pertenecen esas palabras. En este caso exacto, corresponde a la canción "Su nombre es Cristo" de Miel San Marcos, del álbum "25 Años" [2024-2025].
   - NUNCA inventes canciones ni acordes ficticios cuando el usuario busque por fragmentos líricos.
2. Si el usuario menciona "Miel San Marcos 25 años" o canciones conmemorativas:
   - Canciones principales de ese álbum incluyen: "Su nombre es Cristo" (Intro: Bm G D, Verso: Solo hay uno que es digno..., Coro: Su nombre es Cristo, Jesucristo, Él es el rey de gloria).
   - Asegúrate de entregar esta versión en vivo con sus acordes exactos.
3. Para cada versión, proporciona los acordes completos en formato ChordPro con corchetes [Bm] [G] [D] sobre la letra con etiquetas: [Intro], [Verso 1], [Coro], [Puente], [Outro].
4. Si hay varias grabaciones (ej: Versión En Vivo 25 Años, Versión Estudio, o Versión Congregacional), entrégalas claramente diferenciadas.

Reglas de salida:
- Responde EXCLUSIVAMENTE con un JSON válido con la propiedad "versions" conteniendo un arreglo de 2 o 3 objetos.
- Cada versión debe contener:
  - "title": Título exacto de la canción (ej: "Su nombre es Cristo").
  - "versionTitle": Descripción clara (ej: "Versión Álbum 25 Años (En Vivo)", "Versión Original de Estudio").
  - "artist": Nombre del artista o ministerio (ej: "Miel San Marcos").
  - "originalKey": Tono en cifrado americano (ej: Bm, D, G, Em).
  - "tempo": Pulsos por minuto (BPM).
  - "timeSignature": Compás ("4/4", "6/8").
  - "previewSnippet": Primera estrofa o coro para que el usuario identifique la letra inmediatamente.
  - "content": Letra completa con acordes en formato ChordPro [Bm]Dios es [G]bueno.
  - "scriptureReference": Pasajes bíblicos de la Reina Valera 1960 que fundamentan la canción.
  - "notes": Breve indicación de dinámica o instrumentación para el equipo.
`;

  const userPrompt = `
Búsqueda del usuario: "${trimmedQuery}".
${requestedKey ? `Tono preferido para el arreglo: ${requestedKey}.` : 'Identifica el tono original de cada versión.'}

Si la búsqueda especifica un álbum, evento o año (por ejemplo "25 Años", "En Vivo", "Acústico") o cita un verso ("solo hay uno que es digno..."), la versión conmemorativa oficial DEBE encabezar la lista con sus acordes y tempo reales.

Estructura requerida en JSON:
{
  "versions": [
    {
      "title": "Título de la canción",
      "versionTitle": "Ej: Versión Conmemorativa 25 Años (En Vivo)",
      "artist": "Artista",
      "originalKey": "Bm",
      "tempo": 72,
      "timeSignature": "4/4",
      "previewSnippet": "Solo hay uno que es digno...",
      "content": "[Intro]\\n[Bm] [G] [D]\\n\\n[Verso 1]\\n...",
      "scriptureReference": "Apocalipsis 5:9-12 / Filipenses 2:9-11",
      "notes": "Dinámica e instrumentación..."
    }
  ]
}
`;

  // Modelos a probar: Gemini 3.8 Flash como primera opción solicitada por el usuario
  const modelsToTry: string[] = [];
  if (modelPreference === 'gemini-3.5-flash-lite') {
    modelsToTry.push('gemini-3.5-flash-lite', 'gemini-3.8-flash');
  } else {
    modelsToTry.push('gemini-3.8-flash', 'gemini-3.5-flash-lite');
  }

  let lastError: any = null;

  for (const activeKey of keysToTry) {
    const client = new GoogleGenAI({ apiKey: activeKey });

    for (const model of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const config: any = {
            responseMimeType: 'application/json',
            temperature: 0.1,
          };

          // Optimizar nivel de pensamiento para modelos que lo soportan (Gemini 3 Flash)
          if (model.includes('3.8') || model.includes('3-')) {
            config.thinkingConfig = { thinkingLevel: 'LOW' };
          }

          const response = await (client as any).models.generateContent({
            model,
            contents: `${systemInstruction}\n\n${userPrompt}`,
            config
          });

          const responseText = response.text || (response as any).candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            let versionsList: any[] = [];
            if (Array.isArray(parsed.versions) && parsed.versions.length > 0) {
              versionsList = parsed.versions;
            } else if (Array.isArray(parsed)) {
              versionsList = parsed;
            } else if (parsed.title) {
              versionsList = [parsed];
            }

            if (versionsList.length > 0) {
              const geminiVersions: GeminiSongVersion[] = versionsList.map((item, index) => ({
                id: `gemini-${Date.now()}-${index}`,
                title: item.title || trimmedQuery,
                versionTitle: item.versionTitle || (index === 0 ? 'Versión Gemini 3.8 AI' : `Versión Alternativa ${index + 1}`),
                artist: item.artist || 'Artista Cristiano',
                originalKey: item.originalKey || 'G',
                tempo: Number(item.tempo) || 72,
                timeSignature: item.timeSignature || '4/4',
                previewSnippet: item.previewSnippet || '',
                content: item.content || '',
                scriptureReference: item.scriptureReference || '',
                notes: item.notes || '',
                source: 'gemini' as const
              }));

              // Esperar resultados de LaCuerda y combinarlos
              const lacuerdaSongs = await lacuerdaPromise;
              if (lacuerdaSongs.length > 0) {
                // Colocar la versión de LaCuerda como primera o segunda opción verificada
                return [
                  ...lacuerdaSongs.map(v => ({ ...v, source: 'lacuerda' as const })),
                  ...geminiVersions
                ];
              }

              return geminiVersions;
            }
          }
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || '';
          const isTransient = msg.includes('503') || msg.includes('demand') || msg.includes('fetch failed') || msg.includes('UNAVAILABLE') || msg.includes('ECONNRESET');

          if (isTransient && attempt < 2) {
            console.log(`Intento ${attempt} con modelo ${model} encontró: ${msg.slice(0, 60)}. Reintentando...`);
            await new Promise(r => setTimeout(r, 800));
            continue;
          }
          break; // Pasar al siguiente modelo (ej: de 3.8 a 3.5-lite)
        }
      }
    }
  }

  // Si Gemini falló por alta demanda temporal pero LaCuerda tiene la canción, retornar la de LaCuerda
  const lacuerdaFallback = await lacuerdaPromise;
  if (lacuerdaFallback.length > 0) {
    return lacuerdaFallback.map(v => ({ ...v, source: 'lacuerda' as const }));
  }

  const errText = lastError?.message || '';
  if (errText.includes('503') || errText.includes('demand')) {
    throw new Error('Los servidores de Gemini están con alta demanda en este momento. Puedes usar la pestaña de LaCuerda.net directo o reintentar en unos segundos.');
  }
  if (errText.includes('fetch failed') || errText.includes('network') || errText.includes('ENOTFOUND')) {
    throw new Error('Intermitencia de red temporal al conectar con Google Gemini. Por favor presiona "Buscar con IA" de nuevo.');
  }
  if (errText.includes('API key') || errText.includes('403') || errText.includes('PERMISSION_DENIED')) {
    throw new Error('La clave de API de Gemini ingresada es inválida o ha expirado. Limpia el campo para usar la clave de .env.local.');
  }

  throw new Error(errText || 'Error al comunicarse con la API de Gemini. Por favor reintenta.');
}
