'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addVerse } from '@/lib/storage';
import { Verse } from '@/lib/types';

function generateId() {
  return `verse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const inputClass =
  'w-full border border-blue-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white min-h-[48px]';

export default function AddVersePage() {
  const router = useRouter();
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reference.trim()) {
      setError('Bitte gib eine Bibelstelle ein (z. B. Johannes 3:16).');
      return;
    }
    if (!text.trim()) {
      setError('Bitte gib den Verstext ein.');
      return;
    }

    setSaving(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = Date.now();
    const verse: Verse = {
      id: generateId(),
      reference: reference.trim(),
      text: text.trim(),
      tags,
      createdAt: now,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: now,
      lastReview: null,
      reviewCount: 0,
      successCount: 0,
    };

    addVerse(verse);
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
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-blue-800">
            Bibelstelle <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-blue-400">z. B. Johannes 3:16</p>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Johannes 3:16"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-blue-800">
            Verstext <span className="text-red-400">*</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Denn also hat Gott die Welt geliebt…"
            rows={5}
            className={`${inputClass} resize-none h-auto`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-blue-800">
            Tags / Kategorien
          </label>
          <p className="text-xs text-blue-400">Kommagetrennt, z. B. Glaube, Liebe</p>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Glaube, Liebe"
            className={inputClass}
          />
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
