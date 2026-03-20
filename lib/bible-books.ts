export interface BibleBook {
  name: string;
  abbrevs: string[];
  testament: 'AT' | 'NT';
  bgName: string; // BibleGateway search name
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Altes Testament
  { name: '1. Mose', abbrevs: ['1Mo', '1.Mo', 'Gen', '1Mos'], testament: 'AT', bgName: 'Genesis' },
  { name: '2. Mose', abbrevs: ['2Mo', '2.Mo', 'Ex', '2Mos', 'Exo'], testament: 'AT', bgName: 'Exodus' },
  { name: '3. Mose', abbrevs: ['3Mo', '3.Mo', 'Lev', '3Mos'], testament: 'AT', bgName: 'Levitikus' },
  { name: '4. Mose', abbrevs: ['4Mo', '4.Mo', 'Num', '4Mos'], testament: 'AT', bgName: 'Numeri' },
  { name: '5. Mose', abbrevs: ['5Mo', '5.Mo', 'Dtn', 'Deu', '5Mos'], testament: 'AT', bgName: 'Deuteronomium' },
  { name: 'Josua', abbrevs: ['Jos'], testament: 'AT', bgName: 'Josua' },
  { name: 'Richter', abbrevs: ['Ri'], testament: 'AT', bgName: 'Richter' },
  { name: 'Ruth', abbrevs: ['Rut', 'Ru'], testament: 'AT', bgName: 'Ruth' },
  { name: '1. Samuel', abbrevs: ['1Sam', '1.Sam', '1Sa'], testament: 'AT', bgName: '1.Samuel' },
  { name: '2. Samuel', abbrevs: ['2Sam', '2.Sam', '2Sa'], testament: 'AT', bgName: '2.Samuel' },
  { name: '1. Könige', abbrevs: ['1Kön', '1.Kön', '1Kon', '1Koe'], testament: 'AT', bgName: '1.Könige' },
  { name: '2. Könige', abbrevs: ['2Kön', '2.Kön', '2Kon', '2Koe'], testament: 'AT', bgName: '2.Könige' },
  { name: '1. Chronik', abbrevs: ['1Chr', '1.Chr', '1Ch'], testament: 'AT', bgName: '1.Chronik' },
  { name: '2. Chronik', abbrevs: ['2Chr', '2.Chr', '2Ch'], testament: 'AT', bgName: '2.Chronik' },
  { name: 'Esra', abbrevs: ['Esr', 'Esra'], testament: 'AT', bgName: 'Esra' },
  { name: 'Nehemia', abbrevs: ['Neh'], testament: 'AT', bgName: 'Nehemia' },
  { name: 'Ester', abbrevs: ['Est', 'Esth'], testament: 'AT', bgName: 'Ester' },
  { name: 'Hiob', abbrevs: ['Hi', 'Job'], testament: 'AT', bgName: 'Hiob' },
  { name: 'Psalmen', abbrevs: ['Ps', 'Psa'], testament: 'AT', bgName: 'Psalmen' },
  { name: 'Sprüche', abbrevs: ['Spr', 'Prov', 'Spru'], testament: 'AT', bgName: 'Sprüche' },
  { name: 'Prediger', abbrevs: ['Pred', 'Koh', 'Ecc'], testament: 'AT', bgName: 'Prediger' },
  { name: 'Hohelied', abbrevs: ['Hld', 'Hhld', 'SoS'], testament: 'AT', bgName: 'Hohelied' },
  { name: 'Jesaja', abbrevs: ['Jes', 'Isa'], testament: 'AT', bgName: 'Jesaja' },
  { name: 'Jeremia', abbrevs: ['Jer'], testament: 'AT', bgName: 'Jeremia' },
  { name: 'Klagelieder', abbrevs: ['Kla', 'Klgl', 'Lam'], testament: 'AT', bgName: 'Klagelieder' },
  { name: 'Hesekiel', abbrevs: ['Hes', 'Ez', 'Eze'], testament: 'AT', bgName: 'Hesekiel' },
  { name: 'Daniel', abbrevs: ['Dan', 'Da'], testament: 'AT', bgName: 'Daniel' },
  { name: 'Hosea', abbrevs: ['Hos'], testament: 'AT', bgName: 'Hosea' },
  { name: 'Joel', abbrevs: ['Joe', 'Jl'], testament: 'AT', bgName: 'Joel' },
  { name: 'Amos', abbrevs: ['Am'], testament: 'AT', bgName: 'Amos' },
  { name: 'Obadja', abbrevs: ['Ob', 'Oba'], testament: 'AT', bgName: 'Obadja' },
  { name: 'Jona', abbrevs: ['Jon'], testament: 'AT', bgName: 'Jona' },
  { name: 'Micha', abbrevs: ['Mi', 'Mic'], testament: 'AT', bgName: 'Micha' },
  { name: 'Nahum', abbrevs: ['Na', 'Nah'], testament: 'AT', bgName: 'Nahum' },
  { name: 'Habakuk', abbrevs: ['Hab'], testament: 'AT', bgName: 'Habakuk' },
  { name: 'Zefanja', abbrevs: ['Zef', 'Zeph', 'Zef'], testament: 'AT', bgName: 'Zefanja' },
  { name: 'Haggai', abbrevs: ['Hag'], testament: 'AT', bgName: 'Haggai' },
  { name: 'Sacharja', abbrevs: ['Sach', 'Zach', 'Sak'], testament: 'AT', bgName: 'Sacharja' },
  { name: 'Maleachi', abbrevs: ['Mal'], testament: 'AT', bgName: 'Maleachi' },
  // Neues Testament
  { name: 'Matthäus', abbrevs: ['Mt', 'Matth', 'Mat', 'Matt'], testament: 'NT', bgName: 'Matthäus' },
  { name: 'Markus', abbrevs: ['Mk', 'Mar', 'Mrk'], testament: 'NT', bgName: 'Markus' },
  { name: 'Lukas', abbrevs: ['Lk', 'Luk'], testament: 'NT', bgName: 'Lukas' },
  { name: 'Johannes', abbrevs: ['Joh', 'Jn', 'Jo'], testament: 'NT', bgName: 'Johannes' },
  { name: 'Apostelgeschichte', abbrevs: ['Apg', 'AG', 'Act', 'Apst'], testament: 'NT', bgName: 'Apostelgeschichte' },
  { name: 'Römer', abbrevs: ['Röm', 'Rom', 'Roe'], testament: 'NT', bgName: 'Römer' },
  { name: '1. Korinther', abbrevs: ['1Kor', '1.Kor', '1Cor', '1Ko'], testament: 'NT', bgName: '1.Korinther' },
  { name: '2. Korinther', abbrevs: ['2Kor', '2.Kor', '2Cor', '2Ko'], testament: 'NT', bgName: '2.Korinther' },
  { name: 'Galater', abbrevs: ['Gal', 'Ga'], testament: 'NT', bgName: 'Galater' },
  { name: 'Epheser', abbrevs: ['Eph', 'Eph'], testament: 'NT', bgName: 'Epheser' },
  { name: 'Philipper', abbrevs: ['Phil', 'Php', 'Flp'], testament: 'NT', bgName: 'Philipper' },
  { name: 'Kolosser', abbrevs: ['Kol', 'Col'], testament: 'NT', bgName: 'Kolosser' },
  { name: '1. Thessalonicher', abbrevs: ['1Thess', '1.Thess', '1Th', '1Ths'], testament: 'NT', bgName: '1.Thessalonicher' },
  { name: '2. Thessalonicher', abbrevs: ['2Thess', '2.Thess', '2Th', '2Ths'], testament: 'NT', bgName: '2.Thessalonicher' },
  { name: '1. Timotheus', abbrevs: ['1Tim', '1.Tim', '1Ti'], testament: 'NT', bgName: '1.Timotheus' },
  { name: '2. Timotheus', abbrevs: ['2Tim', '2.Tim', '2Ti'], testament: 'NT', bgName: '2.Timotheus' },
  { name: 'Titus', abbrevs: ['Tit', 'Tit'], testament: 'NT', bgName: 'Titus' },
  { name: 'Philemon', abbrevs: ['Phm', 'Phlm'], testament: 'NT', bgName: 'Philemon' },
  { name: 'Hebräer', abbrevs: ['Hebr', 'Heb', 'Hbr'], testament: 'NT', bgName: 'Hebräer' },
  { name: 'Jakobus', abbrevs: ['Jak', 'Ja'], testament: 'NT', bgName: 'Jakobus' },
  { name: '1. Petrus', abbrevs: ['1Pet', '1.Pet', '1Pe', '1Ptr'], testament: 'NT', bgName: '1.Petrus' },
  { name: '2. Petrus', abbrevs: ['2Pet', '2.Pet', '2Pe', '2Ptr'], testament: 'NT', bgName: '2.Petrus' },
  { name: '1. Johannes', abbrevs: ['1Joh', '1.Joh', '1Jn', '1Jo'], testament: 'NT', bgName: '1.Johannes' },
  { name: '2. Johannes', abbrevs: ['2Joh', '2.Joh', '2Jn', '2Jo'], testament: 'NT', bgName: '2.Johannes' },
  { name: '3. Johannes', abbrevs: ['3Joh', '3.Joh', '3Jn', '3Jo'], testament: 'NT', bgName: '3.Johannes' },
  { name: 'Judas', abbrevs: ['Jud', 'Ju'], testament: 'NT', bgName: 'Judas' },
  { name: 'Offenbarung', abbrevs: ['Offb', 'Off', 'Apk', 'Rev', 'Apoc'], testament: 'NT', bgName: 'Offenbarung' },
];

export function searchBooks(query: string): BibleBook[] {
  if (!query || query.length < 1) return [];

  const q = query.trim().toLowerCase();

  // Score each book
  const scored = BIBLE_BOOKS.map((book) => {
    const nameLower = book.name.toLowerCase();
    let score = 0;

    // Exact match on full name
    if (nameLower === q) score = 100;
    // Name starts with query
    else if (nameLower.startsWith(q)) score = 80;
    // Any abbreviation matches exactly
    else if (book.abbrevs.some((a) => a.toLowerCase() === q)) score = 90;
    // Any abbreviation starts with query
    else if (book.abbrevs.some((a) => a.toLowerCase().startsWith(q))) score = 70;
    // Name contains query
    else if (nameLower.includes(q)) score = 40;

    return { book, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.book)
    .slice(0, 8);
}

/**
 * Given a typed reference like "Phil 4,13" or "Philipper 4:13",
 * try to find the matching book and return the BibleGateway search string.
 * Returns null if no complete reference is found.
 */
export function parseReference(input: string): { bgRef: string; display: string } | null {
  const trimmed = input.trim();
  // Match: optional number prefix, book name, then chapter, separator, verse
  // e.g. "Philipper 4,13" or "Phil 4:13" or "1. Mose 1,1"
  const match = trimmed.match(/^(.+?)\s+(\d+)[,:.](\d+)$/);
  if (!match) return null;

  const bookPart = match[1].trim();
  const chapter = match[2];
  const verse = match[3];

  // Find the book
  const q = bookPart.toLowerCase();
  const found = BIBLE_BOOKS.find(
    (b) =>
      b.name.toLowerCase() === q ||
      b.abbrevs.some((a) => a.toLowerCase() === q)
  );

  if (!found) return null;

  const bgRef = `${found.bgName}+${chapter}:${verse}`;
  const display = `${found.name} ${chapter},${verse}`;
  return { bgRef, display };
}
