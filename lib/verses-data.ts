import { Verse } from './types';

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

function makeVerse(
  id: string,
  reference: string,
  text: string,
  tags: string[]
): Verse {
  return {
    id,
    reference,
    text,
    tags,
    createdAt: now,
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: now, // due immediately
    lastReview: null,
    reviewCount: 0,
    successCount: 0,
  };
}

export const PRELOADED_VERSES: Verse[] = [
  makeVerse(
    'pre-1',
    'Johannes 3,16',
    'Denn Gott hat der Welt seine Liebe dadurch gezeigt, dass er seinen einzigen Sohn für sie hergab, damit jeder, der an ihn glaubt, das ewige Leben hat und nicht verloren geht.',
    ['Glaube', 'Liebe', 'Evangelium']
  ),
  makeVerse(
    'pre-2',
    'Psalm 23,1',
    'Der Herr ist mein Hirte, darum leide ich keinen Mangel.',
    ['Vertrauen', 'Fürsorge']
  ),
  makeVerse(
    'pre-3',
    'Römer 8,28',
    'Eines aber wissen wir: Alles trägt zum Besten derer bei, die Gott lieben; sie sind ja in Übereinstimmung mit seinem Plan berufen.',
    ['Vertrauen', 'Vorsehung']
  ),
  makeVerse(
    'pre-4',
    'Philipper 4,13',
    'Nichts ist mir unmöglich, weil der, der bei mir ist, mich stark macht.',
    ['Kraft', 'Ermutigung']
  ),
  makeVerse(
    'pre-5',
    'Jeremia 29,11',
    'Denn ich kenne die Pläne, die ich für euch habe – Pläne zum Wohlergehen und nicht zum Schaden, um euch eine Zukunft und eine Hoffnung zu geben.',
    ['Hoffnung', 'Zukunft']
  ),
  makeVerse(
    'pre-6',
    'Matthäus 6,33',
    'Es soll euch zuerst um Gottes Reich und Gottes Gerechtigkeit gehen, dann wird euch das Übrige alles dazugegeben.',
    ['Prioritäten', 'Vertrauen']
  ),
  makeVerse(
    'pre-7',
    'Psalm 46,2',
    'Gott ist für uns Zuflucht und Schutz, in Zeiten der Not schenkt er uns seine Hilfe mehr als genug.',
    ['Zuflucht', 'Kraft']
  ),
  makeVerse(
    'pre-8',
    'Römer 8,38-39',
    'Ja, ich bin überzeugt, dass weder Tod noch Leben, weder Engel noch unsichtbare Mächte, weder Gegenwärtiges noch Zukünftiges, noch gottfeindliche Kräfte, weder Hohes noch Tiefes, noch sonst irgendetwas in der ganzen Schöpfung uns je von der Liebe Gottes trennen kann, die uns geschenkt ist in Jesus Christus, unserem Herrn.',
    ['Liebe', 'Sicherheit']
  ),
  makeVerse(
    'pre-9',
    'Johannes 14,6',
    '»Ich bin der Weg«, antwortete Jesus, »ich bin die Wahrheit, und ich bin das Leben. Zum Vater kommt man nur durch mich.',
    ['Jesus', 'Evangelium', 'Wahrheit']
  ),
  makeVerse(
    'pre-10',
    'Galater 5,22-23',
    'Die Frucht hingegen, die der Geist Gottes hervorbringt, besteht in Liebe, Freude, Frieden, Geduld, Freundlichkeit, Güte, Treue, Rücksichtnahme und Selbstbeherrschung. Gegen solches Verhalten hat kein Gesetz etwas einzuwenden.',
    ['Heiliger Geist', 'Charakter']
  ),
];
