// German stop words — NEVER become blanks
export const STOP_WORDS = new Set([
  'der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
  'des', 'dem', 'den', 'und', 'oder', 'aber', 'dass', 'weil', 'wenn', 'als',
  'wie', 'ist', 'sind', 'war', 'waren', 'sei', 'seien', 'wird', 'werden',
  'wurde', 'wurden', 'hat', 'haben', 'hatte', 'hatten', 'ich', 'du', 'er',
  'sie', 'es', 'wir', 'ihr', 'mein', 'dein', 'sein', 'unser', 'euer', 'nicht',
  'auch', 'nur', 'noch', 'schon', 'so', 'da', 'hier', 'dort', 'auf', 'in',
  'an', 'bei', 'mit', 'von', 'zu', 'aus', 'nach', 'über', 'unter', 'vor',
  'hinter', 'neben', 'für', 'durch', 'ohne', 'um', 'bis', 'seit', 'gegen',
  'zwischen', 'denn', 'sondern', 'ob', 'damit', 'obwohl', 'was', 'wer', 'wo',
  'welche', 'welcher', 'welches', 'mir', 'dir', 'ihm', 'uns', 'euch', 'ihnen',
  'mich', 'dich', 'ihn', 'man',
]);

// Auxiliary verbs that should not become blanks in 'meister' mode
const AUXILIARY_VERBS = new Set([
  'ist', 'sind', 'war', 'waren', 'sei', 'seien', 'wird', 'werden', 'wurde',
  'wurden', 'hat', 'haben', 'hatte', 'hatten',
]);

export type WordClass = 'noun' | 'verb' | 'adjective' | 'other';

export function classifyWord(word: string): WordClass {
  // Strip punctuation for classification
  const clean = word.replace(/[.,;:!?»«„""'']+/g, '');
  const lower = clean.toLowerCase();

  if (STOP_WORDS.has(lower)) return 'other';

  // Nouns: start with uppercase AND length > 2
  if (clean.length > 2 && clean[0] === clean[0].toUpperCase() && clean[0] !== clean[0].toLowerCase()) {
    return 'noun';
  }

  // Verbs: ends with common German verb suffixes AND not a stop word
  const verbSuffixes = ['eten', 'eten', 'ten', 'ete', 'est', 'et', 'st', 'en', 'te', 't'];
  for (const suffix of verbSuffixes) {
    if (lower.endsWith(suffix) && lower.length > suffix.length + 1) {
      return 'verb';
    }
  }

  // Adjectives: ends with adjectival suffixes AND length > 4 AND not a stop word
  const adjSuffixes = ['er', 'em', 'en', 'es', 'e'];
  for (const suffix of adjSuffixes) {
    if (lower.endsWith(suffix) && lower.length > 4) {
      return 'adjective';
    }
  }

  return 'other';
}

export interface BlankWord {
  word: string;
  isBlank: boolean;
  userInput: string;
}

export type Difficulty = 'einfach' | 'normal' | 'meister';

export function generateSmartGaps(verseText: string, difficulty: Difficulty): BlankWord[] {
  const words = verseText.split(/\s+/);

  // Build classification for each word
  const classified = words.map((word) => ({
    word,
    class: classifyWord(word),
    clean: word.replace(/[.,;:!?»«„""'']+/g, ''),
  }));

  let blankIndices = new Set<number>();

  if (difficulty === 'einfach') {
    // Pick 2 nouns (longest first). If fewer than 2 nouns, pick 1 noun + 1 verb.
    const nounIndices = classified
      .map((w, i) => ({ i, len: w.clean.length, cls: w.class }))
      .filter((w) => w.cls === 'noun')
      .sort((a, b) => b.len - a.len);

    if (nounIndices.length >= 2) {
      blankIndices.add(nounIndices[0].i);
      blankIndices.add(nounIndices[1].i);
    } else if (nounIndices.length === 1) {
      blankIndices.add(nounIndices[0].i);
      // Find 1 verb
      const verbIdx = classified.findIndex((w) => w.class === 'verb');
      if (verbIdx >= 0) blankIndices.add(verbIdx);
    } else {
      // No nouns — pick 2 verbs
      const verbIndices = classified
        .map((w, i) => ({ i, cls: w.class }))
        .filter((w) => w.cls === 'verb')
        .slice(0, 2);
      verbIndices.forEach((v) => blankIndices.add(v.i));
    }
  } else if (difficulty === 'normal') {
    // Pick every 4th content word (noun/verb/adjective, not stop words). Min 2, max 5.
    let contentCount = 0;
    for (let i = 0; i < classified.length; i++) {
      const cls = classified[i].class;
      if (cls === 'noun' || cls === 'verb' || cls === 'adjective') {
        contentCount++;
        if (contentCount % 4 === 0) {
          blankIndices.add(i);
        }
      }
    }

    // Ensure min 2
    if (blankIndices.size < 2) {
      const contentWords = classified
        .map((w, i) => ({ i, cls: w.class }))
        .filter((w) => w.cls === 'noun' || w.cls === 'verb' || w.cls === 'adjective');
      // Add first content words until we have 2
      for (const cw of contentWords) {
        if (blankIndices.size >= 2) break;
        blankIndices.add(cw.i);
      }
    }

    // Cap at max 5
    if (blankIndices.size > 5) {
      const arr = Array.from(blankIndices).slice(0, 5);
      blankIndices = new Set(arr);
    }
  } else {
    // meister: all nouns + all strong verbs (not auxiliary)
    for (let i = 0; i < classified.length; i++) {
      const { class: cls, clean } = classified[i];
      const lower = clean.toLowerCase();
      if (cls === 'noun') {
        blankIndices.add(i);
      } else if (cls === 'verb' && !AUXILIARY_VERBS.has(lower)) {
        blankIndices.add(i);
      }
    }
  }

  return words.map((word, i) => ({
    word,
    isBlank: blankIndices.has(i),
    userInput: '',
  }));
}

// ── Synonym detection ───────────────────────────────────────────────────────

const SYNONYM_GROUPS: string[][] = [
  ['hergab', 'hingab', 'gab'],
  ['geliebt', 'liebe', 'liebte'],
  ['glaubt', 'vertraut', 'glauben'],
  ['sterben', 'umkommen', 'vergehen'],
  ['leben', 'existieren', 'dasein'],
  ['stark', 'kräftig', 'mächtig', 'allmächtig'],
  ['Herr', 'Gott', 'Vater'],
  ['Rettung', 'Heil', 'Erlösung'],
  ['Freude', 'Wonne', 'Fröhlichkeit'],
  ['Frieden', 'Ruhe', 'Stille'],
];

export function isSynonym(expected: string, given: string): boolean {
  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/[.,;:!?»«„""'']+/g, '');

  const exp = normalize(expected);
  const giv = normalize(given);

  if (exp === giv) return false; // exact match, not just a synonym

  for (const group of SYNONYM_GROUPS) {
    const normalizedGroup = group.map(normalize);
    if (normalizedGroup.includes(exp) && normalizedGroup.includes(giv)) {
      return true;
    }
  }
  return false;
}
