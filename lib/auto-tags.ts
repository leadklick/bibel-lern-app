// Book-based tag suggestions (German Bible book names → tags)
const BOOK_TAGS: Record<string, string[]> = {
  // Altes Testament
  '1. Mose': ['Verheissung', 'Schöpfung'],
  '2. Mose': ['Befreiung', 'Vertrauen'],
  '3. Mose': ['Heiligkeit'],
  '4. Mose': ['Vertrauen'],
  '5. Mose': ['Gehorsam', 'Vertrauen'],
  Josua: ['Mut', 'Vertrauen'],
  Richter: ['Treue'],
  Ruth: ['Treue', 'Hoffnung'],
  '1. Samuel': ['Vertrauen'],
  '2. Samuel': ['Gnade'],
  '1. Könige': ['Weisheit'],
  '2. Könige': ['Vertrauen'],
  '1. Chronik': ['Lob'],
  '2. Chronik': ['Lob'],
  Esra: ['Erneuerung'],
  Nehemia: ['Mut', 'Erneuerung'],
  Ester: ['Mut', 'Vertrauen'],
  Hiob: ['Vertrauen', 'Leid'],
  Psalmen: ['Gebet', 'Lob', 'Vertrauen'],
  'Sprüche': ['Weisheit'],
  Prediger: ['Weisheit'],
  Hohelied: ['Liebe'],
  Jesaja: ['Verheissung', 'Hoffnung'],
  Jeremia: ['Hoffnung', 'Verheissung'],
  Klagelieder: ['Hoffnung', 'Leid'],
  Hesekiel: ['Hoffnung', 'Erneuerung'],
  Daniel: ['Mut', 'Vertrauen'],
  Hosea: ['Liebe', 'Gnade'],
  Joel: ['Hoffnung', 'Erneuerung'],
  Amos: ['Gerechtigkeit'],
  Obadja: ['Gerechtigkeit'],
  Jona: ['Gnade', 'Gehorsam'],
  Micha: ['Gerechtigkeit', 'Hoffnung'],
  Nahum: ['Vertrauen'],
  Habakuk: ['Vertrauen', 'Hoffnung'],
  Zefanja: ['Hoffnung'],
  Haggai: ['Gehorsam'],
  Sacharja: ['Hoffnung', 'Verheissung'],
  Maleachi: ['Treue', 'Verheissung'],
  // Neues Testament
  'Matthäus': ['Jesus', 'Evangelium'],
  Markus: ['Jesus', 'Evangelium'],
  Lukas: ['Jesus', 'Evangelium'],
  Johannes: ['Jesus', 'Evangelium', 'Liebe'],
  Apostelgeschichte: ['Geist', 'Ermutigung'],
  'Römer': ['Gnade', 'Glaube'],
  '1. Korinther': ['Ermutigung', 'Liebe'],
  '2. Korinther': ['Ermutigung', 'Gnade'],
  Galater: ['Freiheit', 'Geist'],
  Epheser: ['Gnade', 'Geist'],
  Philipper: ['Freude', 'Ermutigung'],
  Kolosser: ['Jesus'],
  '1. Thessalonicher': ['Hoffnung', 'Ermutigung'],
  '2. Thessalonicher': ['Hoffnung'],
  '1. Timotheus': ['Glaube', 'Ermutigung'],
  '2. Timotheus': ['Mut', 'Glaube'],
  Titus: ['Gnade', 'Glaube'],
  Philemon: ['Gnade'],
  'Hebräer': ['Glaube', 'Vertrauen'],
  Jakobus: ['Glaube', 'Weisheit'],
  '1. Petrus': ['Hoffnung', 'Gnade'],
  '2. Petrus': ['Glaube', 'Hoffnung'],
  '1. Johannes': ['Liebe'],
  '2. Johannes': ['Liebe'],
  '3. Johannes': ['Treue'],
  Judas: ['Glaube'],
  Offenbarung: ['Hoffnung', 'Ewigkeit'],
};

// Keyword → tag mapping (search in verse text, case-insensitive)
const KEYWORD_TAGS: Array<{ patterns: string[]; tag: string }> = [
  { patterns: ['liebe', 'liebt', 'geliebt'], tag: 'Liebe' },
  { patterns: ['glaube', 'glaubt', 'vertrauen'], tag: 'Glaube' },
  { patterns: ['gebet', 'bete', 'betet', 'bitte'], tag: 'Gebet' },
  { patterns: ['freude', 'freut', 'fröhlich'], tag: 'Freude' },
  { patterns: ['hoffnung', 'hoffe', 'hofft'], tag: 'Hoffnung' },
  { patterns: ['angst', 'fürchtet', 'furcht'], tag: 'Mut' },
  { patterns: ['frieden', 'ruhe'], tag: 'Frieden' },
  { patterns: ['stärke', 'stark', 'kraft'], tag: 'Stärke' },
  { patterns: ['gnade', 'gnädig'], tag: 'Gnade' },
  { patterns: ['lob', 'lobt', 'preist'], tag: 'Lob' },
  { patterns: ['weisheit', 'weise'], tag: 'Weisheit' },
  { patterns: ['ewigkeit', 'ewig'], tag: 'Ewigkeit' },
  { patterns: ['heilig', 'heiligung'], tag: 'Heiligkeit' },
  { patterns: ['jesus', 'christus', 'herr'], tag: 'Jesus' },
];

/**
 * Automatically suggests up to 4 tags based on the Bible book name and verse text.
 * Returns a deduplicated array of suggested tags.
 */
export function autoTags(bookName: string, verseText: string): string[] {
  const suggested = new Set<string>();

  // 1. Book-based tags
  const bookMatched = BOOK_TAGS[bookName] ?? [];
  for (const tag of bookMatched) {
    suggested.add(tag);
    if (suggested.size >= 4) break;
  }

  if (suggested.size >= 4) {
    return Array.from(suggested);
  }

  // 2. Keyword-based tags from verse text
  const textLower = verseText.toLowerCase();
  for (const { patterns, tag } of KEYWORD_TAGS) {
    if (suggested.has(tag)) continue;
    const matches = patterns.some((p) => textLower.includes(p));
    if (matches) {
      suggested.add(tag);
      if (suggested.size >= 4) break;
    }
  }

  return Array.from(suggested);
}
