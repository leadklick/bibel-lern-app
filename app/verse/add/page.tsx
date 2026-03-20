'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { addVerse, getDefaultTranslation, setDefaultTranslation } from '@/lib/storage';
import { Verse } from '@/lib/types';
import { searchBooks, BIBLE_BOOKS, BibleBook } from '@/lib/bible-books';
import { autoTags } from '@/lib/auto-tags';

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

  // 3-field reference state
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

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<BibleBook[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  // Verse fetch state
  const [fetchingVerse, setFetchingVerse] = useState(false);
  const [verseFetched, setVerseFetched] = useState(false);

  const bookInputRef = useRef<HTMLInputElement>(null);
  const chapterInputRef = useRef<HTMLInputElement>(null);
  const verseInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const lastFetchedRef = useRef<string>('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTranslation(getDefaultTranslation());
  }, []);

  const handleTranslationChange = (value: string) => {
    setTranslation(value);
    setDefaultTranslation(value);
  };

  // Build the combined reference string: "Buch Kapitel,Vers"
  function buildReference(book: BibleBook | null, chap: string, ver: string): string {
    if (!book || !chap || !ver) return '';
    return `${book.name} ${chap},${ver}`;
  }

  // Build BibleGateway ref for API call
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

      if (!bgVersion) return; // "Eigene" — skip fetch

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
          // Auto-suggest tags based on book and fetched verse text
          if (selectedBook) {
            const suggested = autoTags(selectedBook.name, data.text);
            setTags(suggested);
          }
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

  // Attempt auto-fetch when all three fields are set
  const tryAutoFetch = useCallback(
    (book: BibleBook | null, chap: string, ver: string) => {
      const bgRef = buildBgRef(book, chap, ver);
      if (bgRef) {
        fetchVerseText(bgRef);
      }
    },
    [fetchVerseText]
  );

  // Book input change
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
    // Move focus to Kapitel field
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

  // Chapter field handlers
  const handleChapterChange = (val: string) => {
    setChapter(val);
    setVerseFetched(false);
    lastFetchedRef.current = '';
  };

  const handleChapterBlur = () => {
    tryAutoFetch(selectedBook, chapter, verse);
  };

  // Verse field handlers
  const handleVerseChange = (val: string) => {
    setVerse(val);
    setVerseFetched(false);
    lastFetchedRef.current = '';
  };

  const handleVerseBlur = () => {
    tryAutoFetch(selectedBook, chapter, verse);
  };

  // Also try fetch when verse field gets a value and all others are filled
  useEffect(() => {
    if (selectedBook && chapter && verse) {
      tryAutoFetch(selectedBook, chapter, verse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse, selectedBook, chapter]);

  // Close dropdown when clicking outside
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

  // Tag pill helpers
  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    // Support comma-separated input
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Flush any pending tag input
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
      setError('Verstext konnte nicht geladen werden. Bitte prüfe die Bibelstelle.');
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
    router.push('/verse');
  };

  return (
    <div className="flex flex-col gap-5">
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

              {/* Dropdown suggestions */}
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
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs text-green-500 font-medium mb-1">Vers geladen</p>
                <p className="text-gray-700 text-base leading-relaxed">{text}</p>
              </div>
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

        {/* Tags / Kategorien — pill UI */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-blue-800">
            Tags / Kategorien
          </label>
          <p className="text-xs text-blue-400">
            Werden automatisch vorgeschlagen. Tippe zum Hinzufügen, Enter oder Komma zum Bestätigen.
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
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors text-base min-h-[52px]"
        >
          {saving ? 'Speichere…' : 'Vers speichern'}
        </button>
      </form>
    </div>
  );
}
