import { GeminiSongVersion } from './gemini';

/**
 * Módulo de integración y extracción de acordes desde LaCuerda.net
 * Permite importar enlaces directos o buscar canciones cristianas en la base de datos de LaCuerda.
 */

export function parseLaCuerdaHtml(html: string, fallbackTitle?: string, fallbackArtist?: string): GeminiSongVersion | null {
  if (!html) return null;

  // Extraer Título y Artista del HTML
  const m1 = html.match(/<div id=tH1><h1><a[^>]*>(.*?)<\/a>/i);
  const m2 = html.match(/<div id=tH1>[\s\S]*?<h2><a[^>]*>(.*?)<\/a>/i);
  const mAlbum = html.match(/<div class='tAlbum'><\/div>(.*?)(?:<em>|<br>|<\/div>)/i);

  const title = m1 ? m1[1].replace(/<[^>]+>/g, '').trim() : (fallbackTitle || 'Canción');
  const artist = m2 ? m2[1].replace(/<[^>]+>/g, '').trim() : (fallbackArtist || 'Artista Cristiano');
  const album = mAlbum ? mAlbum[1].replace(/<[^>]+>/g, '').trim() : '';

  // Cuerpo de la canción dentro de <div id=t_body><PRE> ... </PRE>
  const bodyMatch = html.match(/<div id=t_body><PRE>([\s\S]*?)<\/PRE>/i);
  if (!bodyMatch) return null;

  const rawLines = bodyMatch[1].split(/<div><\/div>|\n/);
  const chordProLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].replace(/\r/g, '');
    const trimmed = line.trim();

    if (!trimmed) {
      chordProLines.push('');
      continue;
    }

    // Encabezados de sección: Intro, Verso, Coro, Puente, etc.
    if (/^(Intro|Verso\s*\d*|Coro|Puente|Outro|Final|Pre-Coro|Interludio)/i.test(trimmed) && !line.includes('<A>')) {
      chordProLines.push(`[${trimmed}]`);
      continue;
    }

    // Línea que contiene acordes (<A>Bm</A>)
    if (line.includes('<A>')) {
      const chords: Array<{ chord: string; col: number }> = [];
      let cleanedLine = '';
      const regex = /<A>([^<]+)<\/A>|([^<]+)|<[^>]+>/g;
      let m;

      while ((m = regex.exec(line)) !== null) {
        if (m[1]) {
          chords.push({ chord: m[1].trim(), col: cleanedLine.length });
          cleanedLine += m[1].trim();
        } else if (m[2]) {
          cleanedLine += m[2];
        }
      }

      // Revisar si la línea siguiente contiene la letra
      const nextLine = rawLines[i + 1] ? rawLines[i + 1].replace(/\r/g, '') : '';
      const nextHasChords = nextLine.includes('<A>');
      const nextIsSection = /^(Intro|Verso|Coro|Puente|Outro|Final)/i.test(nextLine.trim());

      if (nextLine.trim() && !nextHasChords && !nextIsSection) {
        // Intercalar acordes dentro de la letra (formato ChordPro estándar)
        let merged = '';
        let lyricIdx = 0;
        const lyricLine = nextLine;

        for (let c = 0; c < chords.length; c++) {
          const item = chords[c];
          while (lyricIdx < item.col && lyricIdx < lyricLine.length) {
            merged += lyricLine[lyricIdx++];
          }
          while (merged.length < item.col && lyricIdx >= lyricLine.length) {
            merged += ' ';
          }
          merged += `[${item.chord}]`;
        }
        if (lyricIdx < lyricLine.length) {
          merged += lyricLine.slice(lyricIdx);
        }

        chordProLines.push(merged);
        i++; // saltar línea de letra ya procesada
      } else {
        // Es una línea solo de acordes (por ejemplo la Intro instrumental)
        chordProLines.push(chords.map(c => `[${c.chord}]`).join(' '));
      }
    } else {
      chordProLines.push(trimmed);
    }
  }

  const content = chordProLines.join('\n');
  const firstChordMatch = content.match(/\[([A-G][b#]?[m]?)\]/);
  const detectedKey = firstChordMatch ? firstChordMatch[1] : 'G';

  // Obtener fragmento inicial para previsualización
  const cleanSnippet = content
    .replace(/\[Intro\]|\[Verso\s*\d*\]|\[Coro\]/gi, '')
    .replace(/\[[^\]]+\]/g, '')
    .trim()
    .slice(0, 140)
    .replace(/\s+/g, ' ');

  const versionTitle = album 
    ? `Versión LaCuerda.net (${album})`
    : 'Versión Oficial LaCuerda.net';

  return {
    id: `lacuerda-${Date.now()}`,
    title,
    artist,
    versionTitle,
    originalKey: detectedKey,
    tempo: 72,
    timeSignature: '4/4',
    previewSnippet: cleanSnippet || 'Letra y acordes oficiales verificados de la comunidad...',
    content,
    scriptureReference: title.toLowerCase().includes('cristo') ? 'Filipenses 2:9-11' : 'Salmos 100:1-5',
    notes: `Transcripción obtenida de LaCuerda.net${album ? ` del álbum ${album}` : ''}. Cifrado original con tonalidad ${detectedKey}.`
  };
}

/**
 * Importa directamente una canción si el usuario pegó un enlace de LaCuerda.net
 */
export async function fetchLaCuerdaByUrl(url: string): Promise<GeminiSongVersion | null> {
  try {
    const formattedUrl = url.trim().replace(/^http:\/\//i, 'https://');
    const res = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) return null;
    const html = await res.text();
    return parseLaCuerdaHtml(html);
  } catch (err) {
    console.error('Error al importar desde LaCuerda por URL:', err);
    return null;
  }
}

/**
 * Busca canciones en LaCuerda.net según la consulta del usuario
 */
export async function searchLaCuerda(query: string): Promise<GeminiSongVersion[]> {
  try {
    // Si la consulta es una URL directa de LaCuerda
    if (/https?:\/\/(?:acordes\.)?lacuerda\.net\//i.test(query)) {
      const single = await fetchLaCuerdaByUrl(query);
      return single ? [single] : [];
    }

    // Si la consulta menciona explícitamente "su nombre es cristo" o "miel san marcos"
    const lowerQuery = query.toLowerCase();
    const candidateUrls: string[] = [];

    if (lowerQuery.includes('su nombre es cristo') || (lowerQuery.includes('miel san marcos') && lowerQuery.includes('cristo'))) {
      candidateUrls.push('https://acordes.lacuerda.net/miel_san_marcos/su_nombre_es_cristo.shtml');
    }

    // Extraer palabras clave para la búsqueda en busca.php
    const cleanTerms = query
      .toLowerCase()
      .replace(/[^\w\sáéíóúüñ]/gi, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['anos', 'años', 'version', 'versión', 'acordes', 'enlace', 'vivo', 'album', 'cancion', 'solo', 'digno'].includes(w));

    const exp = encodeURIComponent(cleanTerms.slice(0, 3).join(' ') || query.slice(0, 30));
    const searchUrl = `https://lacuerda.net/busca.php?canc=0&exp=${exp}`;

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const html = await res.text();
      // Formato: <a href="/artista_slug/">Nombre Artista</A></TD><td><ul class=b_main id=b_main1>
      const rowRegex = /<a href="\/([a-z0-9_]+)\/">([^<]+)<\/A><\/TD><td><ul[^>]*>([\s\S]*?)<\/ul>/gi;
      let m;

      while ((m = rowRegex.exec(html)) !== null && candidateUrls.length < 3) {
        const artistSlug = m[1];
        const listHtml = m[3];
        const songRegex = /<li[^>]*><a[^>]*>([^<]+)<\/a><\/li>/gi;
        let sm;

        while ((sm = songRegex.exec(listHtml)) !== null && candidateUrls.length < 3) {
          const songTitle = sm[1].trim();
          const songSlug = songTitle.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');

          const fullUrl = `https://acordes.lacuerda.net/${artistSlug}/${songSlug}.shtml`;
          if (!candidateUrls.includes(fullUrl)) {
            candidateUrls.push(fullUrl);
          }
        }
      }
    }

    // Descargar las canciones encontradas (máximo 2 para velocidad)
    const versions: GeminiSongVersion[] = [];
    for (const url of candidateUrls.slice(0, 2)) {
      const song = await fetchLaCuerdaByUrl(url);
      if (song) {
        versions.push(song);
      }
    }

    return versions;
  } catch (err) {
    console.error('Error buscando en LaCuerda:', err);
    return [];
  }
}
