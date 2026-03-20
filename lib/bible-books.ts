export interface BibleBook {
  name: string;
  abbrevs: string[];
  testament: 'AT' | 'NT';
  bgName: string; // BibleGateway search name
  bookNumber: number; // canonical book number 1–66
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Altes Testament
  { name: '1. Mose', abbrevs: ['1Mo', '1.Mo', 'Gen', '1Mos'], testament: 'AT', bgName: 'Genesis', bookNumber: 1 },
  { name: '2. Mose', abbrevs: ['2Mo', '2.Mo', 'Ex', '2Mos', 'Exo'], testament: 'AT', bgName: 'Exodus', bookNumber: 2 },
  { name: '3. Mose', abbrevs: ['3Mo', '3.Mo', 'Lev', '3Mos'], testament: 'AT', bgName: 'Levitikus', bookNumber: 3 },
  { name: '4. Mose', abbrevs: ['4Mo', '4.Mo', 'Num', '4Mos'], testament: 'AT', bgName: 'Numeri', bookNumber: 4 },
  { name: '5. Mose', abbrevs: ['5Mo', '5.Mo', 'Dtn', 'Deu', '5Mos'], testament: 'AT', bgName: 'Deuteronomium', bookNumber: 5 },
  { name: 'Josua', abbrevs: ['Jos'], testament: 'AT', bgName: 'Josua', bookNumber: 6 },
  { name: 'Richter', abbrevs: ['Ri'], testament: 'AT', bgName: 'Richter', bookNumber: 7 },
  { name: 'Ruth', abbrevs: ['Rut', 'Ru'], testament: 'AT', bgName: 'Ruth', bookNumber: 8 },
  { name: '1. Samuel', abbrevs: ['1Sam', '1.Sam', '1Sa'], testament: 'AT', bgName: '1.Samuel', bookNumber: 9 },
  { name: '2. Samuel', abbrevs: ['2Sam', '2.Sam', '2Sa'], testament: 'AT', bgName: '2.Samuel', bookNumber: 10 },
  { name: '1. Könige', abbrevs: ['1Kön', '1.Kön', '1Kon', '1Koe'], testament: 'AT', bgName: '1.Könige', bookNumber: 11 },
  { name: '2. Könige', abbrevs: ['2Kön', '2.Kön', '2Kon', '2Koe'], testament: 'AT', bgName: '2.Könige', bookNumber: 12 },
  { name: '1. Chronik', abbrevs: ['1Chr', '1.Chr', '1Ch'], testament: 'AT', bgName: '1.Chronik', bookNumber: 13 },
  { name: '2. Chronik', abbrevs: ['2Chr', '2.Chr', '2Ch'], testament: 'AT', bgName: '2.Chronik', bookNumber: 14 },
  { name: 'Esra', abbrevs: ['Esr', 'Esra'], testament: 'AT', bgName: 'Esra', bookNumber: 15 },
  { name: 'Nehemia', abbrevs: ['Neh'], testament: 'AT', bgName: 'Nehemia', bookNumber: 16 },
  { name: 'Ester', abbrevs: ['Est', 'Esth'], testament: 'AT', bgName: 'Ester', bookNumber: 17 },
  { name: 'Hiob', abbrevs: ['Hi', 'Job'], testament: 'AT', bgName: 'Hiob', bookNumber: 18 },
  { name: 'Psalmen', abbrevs: ['Ps', 'Psa'], testament: 'AT', bgName: 'Psalmen', bookNumber: 19 },
  { name: 'Sprüche', abbrevs: ['Spr', 'Prov', 'Spru'], testament: 'AT', bgName: 'Sprüche', bookNumber: 20 },
  { name: 'Prediger', abbrevs: ['Pred', 'Koh', 'Ecc'], testament: 'AT', bgName: 'Prediger', bookNumber: 21 },
  { name: 'Hohelied', abbrevs: ['Hld', 'Hhld', 'SoS'], testament: 'AT', bgName: 'Hohelied', bookNumber: 22 },
  { name: 'Jesaja', abbrevs: ['Jes', 'Isa'], testament: 'AT', bgName: 'Jesaja', bookNumber: 23 },
  { name: 'Jeremia', abbrevs: ['Jer'], testament: 'AT', bgName: 'Jeremia', bookNumber: 24 },
  { name: 'Klagelieder', abbrevs: ['Kla', 'Klgl', 'Lam'], testament: 'AT', bgName: 'Klagelieder', bookNumber: 25 },
  { name: 'Hesekiel', abbrevs: ['Hes', 'Ez', 'Eze'], testament: 'AT', bgName: 'Hesekiel', bookNumber: 26 },
  { name: 'Daniel', abbrevs: ['Dan', 'Da'], testament: 'AT', bgName: 'Daniel', bookNumber: 27 },
  { name: 'Hosea', abbrevs: ['Hos'], testament: 'AT', bgName: 'Hosea', bookNumber: 28 },
  { name: 'Joel', abbrevs: ['Joe', 'Jl'], testament: 'AT', bgName: 'Joel', bookNumber: 29 },
  { name: 'Amos', abbrevs: ['Am'], testament: 'AT', bgName: 'Amos', bookNumber: 30 },
  { name: 'Obadja', abbrevs: ['Ob', 'Oba'], testament: 'AT', bgName: 'Obadja', bookNumber: 31 },
  { name: 'Jona', abbrevs: ['Jon'], testament: 'AT', bgName: 'Jona', bookNumber: 32 },
  { name: 'Micha', abbrevs: ['Mi', 'Mic'], testament: 'AT', bgName: 'Micha', bookNumber: 33 },
  { name: 'Nahum', abbrevs: ['Na', 'Nah'], testament: 'AT', bgName: 'Nahum', bookNumber: 34 },
  { name: 'Habakuk', abbrevs: ['Hab'], testament: 'AT', bgName: 'Habakuk', bookNumber: 35 },
  { name: 'Zefanja', abbrevs: ['Zef', 'Zeph', 'Zef'], testament: 'AT', bgName: 'Zefanja', bookNumber: 36 },
  { name: 'Haggai', abbrevs: ['Hag'], testament: 'AT', bgName: 'Haggai', bookNumber: 37 },
  { name: 'Sacharja', abbrevs: ['Sach', 'Zach', 'Sak'], testament: 'AT', bgName: 'Sacharja', bookNumber: 38 },
  { name: 'Maleachi', abbrevs: ['Mal'], testament: 'AT', bgName: 'Maleachi', bookNumber: 39 },
  // Neues Testament
  { name: 'Matthäus', abbrevs: ['Mt', 'Matth', 'Mat', 'Matt'], testament: 'NT', bgName: 'Matthäus', bookNumber: 40 },
  { name: 'Markus', abbrevs: ['Mk', 'Mar', 'Mrk'], testament: 'NT', bgName: 'Markus', bookNumber: 41 },
  { name: 'Lukas', abbrevs: ['Lk', 'Luk'], testament: 'NT', bgName: 'Lukas', bookNumber: 42 },
  { name: 'Johannes', abbrevs: ['Joh', 'Jn', 'Jo'], testament: 'NT', bgName: 'Johannes', bookNumber: 43 },
  { name: 'Apostelgeschichte', abbrevs: ['Apg', 'AG', 'Act', 'Apst'], testament: 'NT', bgName: 'Apostelgeschichte', bookNumber: 44 },
  { name: 'Römer', abbrevs: ['Röm', 'Rom', 'Roe'], testament: 'NT', bgName: 'Römer', bookNumber: 45 },
  { name: '1. Korinther', abbrevs: ['1Kor', '1.Kor', '1Cor', '1Ko'], testament: 'NT', bgName: '1.Korinther', bookNumber: 46 },
  { name: '2. Korinther', abbrevs: ['2Kor', '2.Kor', '2Cor', '2Ko'], testament: 'NT', bgName: '2.Korinther', bookNumber: 47 },
  { name: 'Galater', abbrevs: ['Gal', 'Ga'], testament: 'NT', bgName: 'Galater', bookNumber: 48 },
  { name: 'Epheser', abbrevs: ['Eph', 'Eph'], testament: 'NT', bgName: 'Epheser', bookNumber: 49 },
  { name: 'Philipper', abbrevs: ['Phil', 'Php', 'Flp'], testament: 'NT', bgName: 'Philipper', bookNumber: 50 },
  { name: 'Kolosser', abbrevs: ['Kol', 'Col'], testament: 'NT', bgName: 'Kolosser', bookNumber: 51 },
  { name: '1. Thessalonicher', abbrevs: ['1Thess', '1.Thess', '1Th', '1Ths'], testament: 'NT', bgName: '1.Thessalonicher', bookNumber: 52 },
  { name: '2. Thessalonicher', abbrevs: ['2Thess', '2.Thess', '2Th', '2Ths'], testament: 'NT', bgName: '2.Thessalonicher', bookNumber: 53 },
  { name: '1. Timotheus', abbrevs: ['1Tim', '1.Tim', '1Ti'], testament: 'NT', bgName: '1.Timotheus', bookNumber: 54 },
  { name: '2. Timotheus', abbrevs: ['2Tim', '2.Tim', '2Ti'], testament: 'NT', bgName: '2.Timotheus', bookNumber: 55 },
  { name: 'Titus', abbrevs: ['Tit', 'Tit'], testament: 'NT', bgName: 'Titus', bookNumber: 56 },
  { name: 'Philemon', abbrevs: ['Phm', 'Phlm'], testament: 'NT', bgName: 'Philemon', bookNumber: 57 },
  { name: 'Hebräer', abbrevs: ['Hebr', 'Heb', 'Hbr'], testament: 'NT', bgName: 'Hebräer', bookNumber: 58 },
  { name: 'Jakobus', abbrevs: ['Jak', 'Ja'], testament: 'NT', bgName: 'Jakobus', bookNumber: 59 },
  { name: '1. Petrus', abbrevs: ['1Pet', '1.Pet', '1Pe', '1Ptr'], testament: 'NT', bgName: '1.Petrus', bookNumber: 60 },
  { name: '2. Petrus', abbrevs: ['2Pet', '2.Pet', '2Pe', '2Ptr'], testament: 'NT', bgName: '2.Petrus', bookNumber: 61 },
  { name: '1. Johannes', abbrevs: ['1Joh', '1.Joh', '1Jn', '1Jo'], testament: 'NT', bgName: '1.Johannes', bookNumber: 62 },
  { name: '2. Johannes', abbrevs: ['2Joh', '2.Joh', '2Jn', '2Jo'], testament: 'NT', bgName: '2.Johannes', bookNumber: 63 },
  { name: '3. Johannes', abbrevs: ['3Joh', '3.Joh', '3Jn', '3Jo'], testament: 'NT', bgName: '3.Johannes', bookNumber: 64 },
  { name: 'Judas', abbrevs: ['Jud', 'Ju'], testament: 'NT', bgName: 'Judas', bookNumber: 65 },
  { name: 'Offenbarung', abbrevs: ['Offb', 'Off', 'Apk', 'Rev', 'Apoc'], testament: 'NT', bgName: 'Offenbarung', bookNumber: 66 },
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
