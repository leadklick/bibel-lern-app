'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { addVerse, getDefaultTranslation, setDefaultTranslation } from '@/lib/storage';
import { Verse } from '@/lib/types';
import { searchBooks, BibleBook } from '@/lib/bible-books';
import { autoTags } from '@/lib/auto-tags';
import Toast from '@/components/Toast';

function generateId() {
  return `verse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const inputClass =
  'w-full border border-blue-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white min-h-[48px]';

const TRANSLATIONS = [
  { value: 'NGU', label: 'Neue Genfer Übersetzung (NGU)', bgVersion: 'NGU-DE' },
  { value: 'LB17', label: 'Lutherbibel 2017', bgVersion: 'LUT' },
  { value: 'SCH2000', label: 'Schlachter 2000', bgVersion: 'SCH2000' },
  { value: 'HFA', label: 'Hoffnung für alle', bgVersion: 'HFA' },
  { value: 'Eigene', label: 'Eigene Übersetzung', bgVersion: null },
];

export default function AddVersePage() {
  const router = useRouter();

  const [bookInput, setBookInput] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');

  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [translation, setTranslation] = useState('NGU');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [suggestions, setSuggestions] = useState<BibleBook[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const [fetchingVerse, setFetchingVerse] = useState(false);
  const [verseFetched, setVerseFetched] = useState(false);

  const bookInputRef = useRef<HTMLInputElement>(null);
  const chapterInputRef = useRef<HTMLInputElement>(null);
  const verseInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const lastFetchedRef = useRef<string>('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTranslation(getDefaultTranslation());
  }, []);

  const handleTranslationChange = (value: string) => {
    setTranslation(value);
    setDefaultTranslation(value);
  };

  function buildReference(book: BibleBook | null, chap: string, ver: string): string {
    if (!book || !chap || !ver) return '';
    return `${book.name} ${chap},${ver}`;
  }

  function buildBgRef(book: BibleBook | null, chap: string, ver: string): string | null {
    if (!book || !chap || !ver) return null;
    return `${book.bgName}+${chap}:${ver}`;
  }

  const fetchVerseText = useCallback(
    async (bgRef: string) => {
      if (bgRef === lastFetchedRef.current) return;
      lastFetchedRef.current = bgRef;

      const translationObj = TRANSLATIONS.find((t) => t.value === translation);
      const bgVersion = translationObj?.bgVersion ?? 'NGU-DE';

      if (!bgVersion) return;

      setFetchingVerse(true);
      setVerseFetched(false);

      try {
        const res = await fetch(
          `/api/verse?ref=${encodeURIComponent(bgRef)}&version=${encodeURIComponent(bgVersion)}`
        );
        const data = await res.json();
        if (data.text) {
          setText(data.text);
          setVerseFetched(true);
          if (selectedBook) {
            const suggested = autoTags(selectedBook.name, data.text);
            setTags(suggested);
          }
          // Auto-scroll to save button
          setTimeout(() => {
            saveButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        }
      } catch {
        // silently fail — user can type manually
      } finally {
        setFetchingVerse(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [translation, selectedBook]
  );

  const tryAutoFetch = useCallback(
    (book: BibleBook | null, chap: string, ver: string) => {
      const bgRef = buildBgRef(book, chap, ver);
      if (bgRef) {
        fetchVerseText(bgRef);
      }
    },
    [fetchVerseText]
  );

  const handleBookInputChange = (val: string) => {
    setBookInput(val);
    setSelectedBook(null);
    setVerseFetched(false);
    setActiveSuggestion(-1);
    lastFetchedRef.current = '';

    if (val.trim().length >= 1) {
      const results = searchBooks(val.trim());
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectBook = (book: BibleBook) => {
    setBookInput(book.name);
    setSelectedBook(book);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    setTimeout(() => {
      chapterInputRef.current?.focus();
    }, 0);
  };

  const handleBookKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      selectBook(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleChapterChange = (val: string) => {
    setChapter(val);
    setVerseFetched(false);
    lastFetchedRef.current = '';
  };

  const handleChapterBlur = () => {
    tryAutoFetch(selectedBook, chapter, verse);
  };

  const handleVerseChange = (val: string) => {
    setVerse(val);
    setVerseFetched(false);
    lastFetchedRef.current = '';
  };

  const handleVerseBlur = () => {
    tryAutoFetch(selectedBook, chapter, verse);
  };

  useEffect(() => {
    if (selectedBook && chapter && verse) {
      tryAutoFetch(selectedBook, chapter, verse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse, selectedBook, chapter]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        bookInputRef.current &&
        !bookInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
    setTags((prev) => {
      const combined = [...prev];
      for (const part of parts) {
        if (!combined.includes(part)) {
          combined.push(part);
        }
      }
      return combined;
    });
    setTagInputValue('');
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInputValue);
    } else if (e.key === 'Backspace' && tagInputValue === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pendingTag = tagInputValue.trim();
    const finalTags = pendingTag
      ? [...tags, ...pendingTag.split(',').map((t) => t.trim()).filter(Boolean)].filter(
          (t, i, arr) => arr.indexOf(t) === i
        )
      : tags;

    const reference = buildReference(selectedBook, chapter, verse);

    if (!reference.trim()) {
      setError('Bitte wähle ein Buch und gib Kapitel und Vers ein (z. B. Philipper 4,13).');
      return;
    }
    if (!text.trim()) {
      setError('Verstext konnte nicht geladen werden. Bitte prüfe die Bibelstelle oder gib den Text manuell ein.');
      return;
    }

    setSaving(true);

    const now = Date.now();
    const verseObj: Verse = {
      id: generateId(),
      reference: reference.trim(),
      text: text.trim(),
      tags: finalTags,
      translation,
      createdAt: now,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: now,
      lastReview: null,
      reviewCount: 0,
      successCount: 0,
    };

    addVerse(verseObj);
    setShowToast(true);

    setTimeout(() => {
      router.push('/verse');
    }, 1400);
  };

  return (
    <div className="flex flex-col gap-5 page-enter">
      {showToast && (
        <Toast message="Vers gespeichert! ✓" type="success" />
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-700 transition-colors min-h-[44px] min-w-[44px] flex items-center text-base font-medium"
        >
          ← Zurück
        </button>
        <h1 className="text-2xl font-bold text-blue-900">Vers hinzufügen</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 md:p-6 flex flex-col gap-5"
      >
        {/* 3-field reference row */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-blue-800">
            Bibelstelle <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-blue-400">z. B. Philipper · 4 · 13</p>

          <div className="flex gap-2 items-start">
            {/* Buch (autocomplete) */}
            <div className="relative flex-[3]">
              <input
                ref={bookInputRef}
                type="text"
                value={bookInput}
                onChange={(e) => handleBookInputChange(e.target.value)}
                onKeyDown={handleBookKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Buch"
                className={inputClass}
                autoComplete="off"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-blue-200 rounded-xl shadow-lg overflow-hidden"
                >
                  {suggestions.map((book, idx) => (
                    <button
                      key={book.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectBook(book);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        idx === activeSuggestion
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-blue-50 text-blue-800'
                      }`}
                    >
                      <span className="font-medium">{book.name}</span>
                      <span className="text-xs text-blue-400 ml-2">{book.testament}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Kapitel */}
            <div className="flex-1">
              <input
                ref={chapterInputRef}
                type="number"
                min={1}
                value={chapter}
                onChange={(e) => handleChapterChange(e.target.value)}
                onBlur={handleChapterBlur}
                placeholder="Kap."
                className={inputClass}
              />
            </div>

            {/* Vers */}
            <div className="flex-1">
              <input
                ref={verseInputRef}
                type="text"
                value={verse}
                onChange={(e) => handleVerseChange(e.target.value)}
                onBlur={handleVerseBlur}
                placeholder="Vers"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Verse preview */}
        {(fetchingVerse || text) && (
          <div className="flex flex-col gap-1.5">
            {fetchingVerse && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-400 text-sm animate-pulse">
                Vers wird geladen…
              </div>
            )}
            {text && !fetchingVerse && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                    Vers geladen ✓
                  </p>
                  <span className="text-xs text-green-500">
                    {wordCount} Wörter · {charCount} Zeichen
                  </span>
                </div>
                <p className="text-gray-700 text-base leading-relaxed">{text}</p>
              </div>
            )}
          </div>
        )}

        {/* Manual text fallback */}
        {!fetchingVerse && !verseFetched && translation === 'Eigene' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-base font-semibold text-blue-800">
              Verstext <span className="text-red-400">*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Gib den Verstext ein…"
              rows={4}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-none"
            />
            {text && (
              <p className="text-xs text-blue-400 text-right">
                {wordCount} Wörter · {charCount} Zeichen
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-blue-800">
            Übersetzung
          </label>
          <select
            value={translation}
            onChange={(e) => handleTranslationChange(e.target.value)}
            className={inputClass}
          >
            {TRANSLATIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags / Kategorien */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-blue-800">
            Tags / Kategorien
          </label>
          <p className="text-xs text-blue-400">
            Werden automatisch vorgeschlagen. Tippe und bestätige mit Enter oder Komma.
          </p>

          <div
            className="flex flex-wrap gap-2 items-center border border-blue-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-300 min-h-[48px] cursor-text"
            onClick={() => tagInputRef.current?.focus()}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="text-blue-500 hover:text-blue-800 transition-colors leading-none ml-0.5"
                  aria-label={`${tag} entfernen`}
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              type="text"
              value={tagInputValue}
              onChange={(e) => setTagInputValue(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              onBlur={() => {
                if (tagInputValue.trim()) addTag(tagInputValue);
              }}
              placeholder={tags.length === 0 ? 'Glaube, Liebe …' : ''}
              className="flex-1 min-w-[120px] outline-none text-base bg-transparent placeholder-blue-300 py-1"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <button
          ref={saveButtonRef}
          type="submit"
          disabled={saving || fetchingVerse}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base min-h-[52px] active:scale-[0.98]"
        >
          {saving ? 'Wird gespeichert…' : fetchingVerse ? 'Vers wird geladen…' : 'Vers speichern'}
        </button>
      </form>
    </div>
  );
}
