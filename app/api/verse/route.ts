import { NextRequest } from 'next/server';

// getbible.net translation codes for fallback
const GETBIBLE_MAP: Record<string, string> = {
  'NGU-DE': 'schlachter',
  'LUT': 'luther1912',
  'SCH2000': 'schlachter',
  'HFA': 'schlachter',
};

// BibleGateway book name → getbible.net book number
const BOOK_NUMBER: Record<string, number> = {
  Genesis:1,Exodus:2,Levitikus:3,Numeri:4,Deuteronomium:5,Josua:6,Richter:7,
  Rut:8,Ruth:8,'1.Samuel':9,'1Samuel':9,'2.Samuel':10,'2Samuel':10,
  '1.Koenige':11,'1Koenige':11,'2.Koenige':12,'2Koenige':12,
  '1.Chronik':13,'1Chronik':13,'2.Chronik':14,'2Chronik':14,
  Esra:15,Nehemia:16,Ester:17,Hiob:18,Psalmen:19,Psalm:19,
  Sprichwörter:20,'Sprüche':20,Prediger:21,Hohelied:22,
  Jesaja:23,Jeremia:24,Klagelieder:25,Hesekiel:26,Ezechiel:26,Daniel:27,
  Hosea:28,Joel:29,Amos:30,Obadja:31,Jona:32,Micha:33,Nahum:34,
  Habakuk:35,Zephanja:36,Haggai:37,Sacharja:38,Maleachi:39,
  Matthäus:40,Markus:41,Lukas:42,Johannes:43,Apostelgeschichte:44,
  Römer:45,Romans:45,'1.Korinther':46,'1Korinther':46,'2.Korinther':47,'2Korinther':47,
  Galater:48,Epheser:49,Philipper:50,Kolosser:51,
  '1.Thessalonicher':52,'1Thessalonicher':52,'2.Thessalonicher':53,'2Thessalonicher':53,
  '1.Timotheus':54,'1Timotheus':54,'2.Timotheus':55,'2Timotheus':55,
  Titus:56,Philemon:57,Hebräer:58,Jakobus:59,
  '1.Petrus':60,'1Petrus':60,'2.Petrus':61,'2Petrus':61,
  '1.Johannes':62,'1Johannes':62,'2.Johannes':63,'2Johannes':63,'3.Johannes':64,'3Johannes':64,
  Judas:65,Offenbarung:66,
};

async function fetchFromBibleGateway(ref: string, version: string): Promise<string | null> {
  try {
    const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=${encodeURIComponent(version)}&interface=print`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    const passageStart = html.indexOf('passage-text');
    if (passageStart === -1) return null;

    const snippet = html.slice(passageStart, passageStart + 8000);

    // Remove chapter numbers (e.g. <span class="chapternum">23 </span>)
    const cleaned = snippet.replace(/<span[^>]+class="chapternum"[^>]*>[\s\S]*?<\/span>/g, '');

    const textMatches: string[] = [];
    const spanRegex = /<span[^>]+class="text[^"]*"[^>]*>([\s\S]*?)<\/span>/g;
    let m: RegExpExecArray | null;
    while ((m = spanRegex.exec(cleaned)) !== null) {
      const clean = m[1]
        .replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (clean) textMatches.push(clean);
    }

    if (textMatches.length === 0) return null;

    // Deduplicate consecutive identical segments
    const deduped = textMatches.filter((t, i) => i === 0 || t !== textMatches[i - 1]);
    return deduped.join(' ').trim() || null;
  } catch {
    return null;
  }
}

async function fetchFromGetBible(ref: string, fallbackTranslation: string): Promise<string | null> {
  try {
    // Parse ref like "Philipper+4:13" → book=Philipper, chapter=4, verse=13
    const decoded = decodeURIComponent(ref).replace(/\+/g, ' ');
    const match = decoded.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return null;

    const [, bookName, chapter, verse] = match;
    const bookNum = BOOK_NUMBER[bookName];
    if (!bookNum) return null;

    const url = `https://api.getbible.net/v2/${fallbackTranslation}/${bookNum}/${chapter}/${verse}.json`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;

    const data = await res.json();
    if (data?.verse) return data.verse.trim();
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref');
  const version = searchParams.get('version') || 'NGU-DE';

  if (!ref) {
    return Response.json({ error: 'Missing ref parameter' }, { status: 400 });
  }

  // Try BibleGateway first
  let text = await fetchFromBibleGateway(ref, version);

  // Fallback: try LUT on BibleGateway if NGU failed (NGU doesn't cover full OT)
  if (!text && version === 'NGU-DE') {
    text = await fetchFromBibleGateway(ref, 'LUT');
  }

  // Final fallback: getbible.net
  if (!text) {
    const fallbackTrans = GETBIBLE_MAP[version] ?? 'schlachter';
    text = await fetchFromGetBible(ref, fallbackTrans);
  }

  if (!text) {
    return Response.json({ error: 'No passage found' }, { status: 404 });
  }

  return Response.json({ text });
}
