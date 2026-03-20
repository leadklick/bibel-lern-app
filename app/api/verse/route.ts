import { NextRequest } from 'next/server';
import { BIBLE_DE } from '@/lib/bible-data';
import { BIBLE_BOOKS } from '@/lib/bible-books';

// getbible.net translation codes for fallback
const GETBIBLE_MAP: Record<string, string> = {
  'NGU-DE': 'schlachter',
  'LUT': 'luther1912',
  'SCH2000': 'schlachter',
  'HFA': 'schlachter',
};

// BibleGateway book name → getbible.net book number (used in remote fallback only)
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

/**
 * Look up a verse in the locally embedded Schlachter Bible.
 * ref format: "Genesis+1:1" or "Philipper+4:13" (BibleGateway-style bgName + chapter:verse)
 * Returns the verse text or null if not found.
 */
function lookupLocalVerse(ref: string): string | null {
  try {
    // Decode and normalise: "Genesis+1:1" → "Genesis 1:1"
    const decoded = decodeURIComponent(ref).replace(/\+/g, ' ');
    const match = decoded.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return null;

    const [, bookName, chapterStr, verseStr] = match;
    const chapter = parseInt(chapterStr, 10);
    const verse = parseInt(verseStr, 10);

    // Resolve bookNumber from BIBLE_BOOKS using bgName or common name/abbrev
    const bookEntry = BIBLE_BOOKS.find(
      (b) =>
        b.bgName === bookName ||
        b.bgName.replace(/\./g, '') === bookName ||
        b.name === bookName ||
        b.abbrevs.some((a) => a === bookName) ||
        // Handle common German aliases (e.g. "Psalm" for "Psalmen", "Hesekiel"/"Ezechiel")
        (bookName === 'Psalm' && b.bookNumber === 19) ||
        (bookName === 'Ezechiel' && b.bookNumber === 26) ||
        (bookName === 'Zephanja' && b.bookNumber === 36)
    );

    if (!bookEntry) return null;

    const bookNum = bookEntry.bookNumber;
    let text = BIBLE_DE[bookNum]?.[chapter]?.[verse] ?? null;
    if (!text) return null;

    // Remove psalm/song headers like "Ein Psalm Davids." or "Ein Lied..."
    text = text.replace(/^(Ein (Psalm|Lied|Gebet|Maskil|Miktam)[^.]*\.\s*)+/i, '').trim();

    // If the text contains a period followed by a capital letter and the real verse
    // content starts after it, extract only the last meaningful sentence
    // (handles cases where verse data bleeds in from previous verse)
    const sentences = text.split(/(?<=[.!?»])\s+(?=[A-ZÄÖÜ])/);
    if (sentences.length > 1) {
      // Check if the last sentence is the "real" verse (shorter, standalone)
      const lastSentence = sentences[sentences.length - 1];
      if (lastSentence.length > 15 && lastSentence.length < text.length * 0.6) {
        text = lastSentence.trim();
      }
    }

    return text;
  } catch {
    return null;
  }
}

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

  // PRIMARY: Try BibleGateway with the requested translation
  let text = await fetchFromBibleGateway(ref, version);

  // If NGU failed (NGU doesn't cover full OT), try LUT
  if (!text && version === 'NGU-DE') {
    text = await fetchFromBibleGateway(ref, 'LUT');
  }

  // FALLBACK: local embedded Schlachter Bible (always works, used when BibleGateway is unavailable)
  if (!text) {
    text = lookupLocalVerse(ref);
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
