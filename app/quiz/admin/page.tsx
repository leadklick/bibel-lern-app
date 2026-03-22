'use client';

import { useEffect, useState, useCallback } from 'react';
import { QuizSet, QuizQuestion } from '@/lib/quiz-types';
import Link from 'next/link';

const CATEGORIES = ['AT', 'NT', 'Evangelien', 'Psalmen', 'Paulus', 'Propheten', 'Gemischt'];

const CATEGORY_COLORS: Record<string, string> = {
  AT: 'bg-amber-100 text-amber-800',
  NT: 'bg-blue-100 text-blue-800',
  Evangelien: 'bg-green-100 text-green-800',
  Psalmen: 'bg-purple-100 text-purple-800',
  Paulus: 'bg-indigo-100 text-indigo-800',
  Propheten: 'bg-orange-100 text-orange-800',
  Gemischt: 'bg-slate-100 text-slate-700',
};

function emptyQuestion(): QuizQuestion {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    answers: ['', '', '', ''],
    correct: 0,
    timeLimit: 20,
    explanation: '',
  };
}

function emptySet(): Omit<QuizSet, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    category: 'Gemischt',
    description: '',
    questions: [],
  };
}

export default function AdminPage() {
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit state
  const [editingSet, setEditingSet] = useState<QuizSet | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [editingQIndex, setEditingQIndex] = useState<number | null>(null);

  // New set form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSetData, setNewSetData] = useState(emptySet());
  const [saving, setSaving] = useState(false);

  const loadSets = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/sets');
      const data = await res.json();
      setSets(data.sets ?? []);
    } catch {
      setError('Fehler beim Laden der Quiz-Sets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetData.title.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/quiz/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSetData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Fehler beim Erstellen.');
        return;
      }
      setSets((prev) => [...prev, data.set]);
      setShowNewForm(false);
      setNewSetData(emptySet());
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSet = async (id: string) => {
    if (!confirm('Quiz-Set wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/quiz/sets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSets((prev) => prev.filter((s) => s.id !== id));
        if (editingSet?.id === id) setEditingSet(null);
      }
    } catch {
      setError('Fehler beim Löschen.');
    }
  };

  const handleDuplicateSet = async (set: QuizSet) => {
    setSaving(true);
    try {
      const res = await fetch('/api/quiz/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${set.title} (Kopie)`,
          category: set.category,
          description: set.description,
          questions: set.questions.map((q) => ({
            ...q,
            id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSets((prev) => [...prev, data.set]);
      }
    } catch {
      setError('Fehler beim Duplizieren.');
    } finally {
      setSaving(false);
    }
  };

  const saveEditingSet = async () => {
    if (!editingSet) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/quiz/sets/${editingSet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSet),
      });
      const data = await res.json();
      if (res.ok) {
        setSets((prev) => prev.map((s) => (s.id === data.set.id ? data.set : s)));
        setEditingSet(data.set);
      } else {
        setError(data.error ?? 'Fehler beim Speichern.');
      }
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setSaving(false);
    }
  };

  // ── Question edit modal ───────────────────────────────────────────────────
  const openQuestion = (q: QuizQuestion, idx: number) => {
    setEditingQuestion({ ...q });
    setEditingQIndex(idx);
  };

  const openNewQuestion = () => {
    setEditingQuestion(emptyQuestion());
    setEditingQIndex(-1); // -1 = new
  };

  const saveQuestion = () => {
    if (!editingSet || !editingQuestion) return;
    const updatedQuestions = [...editingSet.questions];
    if (editingQIndex === -1) {
      updatedQuestions.push(editingQuestion);
    } else if (editingQIndex !== null) {
      updatedQuestions[editingQIndex] = editingQuestion;
    }
    setEditingSet({ ...editingSet, questions: updatedQuestions });
    setEditingQuestion(null);
    setEditingQIndex(null);
  };

  const deleteQuestion = (idx: number) => {
    if (!editingSet) return;
    const updatedQuestions = editingSet.questions.filter((_, i) => i !== idx);
    setEditingSet({ ...editingSet, questions: updatedQuestions });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className="skeleton h-10 rounded-xl w-48" />
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }

  // Question editor modal
  if (editingQuestion !== null && editingSet) {
    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingQuestion(null); setEditingQIndex(null); }}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← Zurück
          </button>
          <h2 className="font-bold text-slate-900">
            {editingQIndex === -1 ? 'Neue Frage' : `Frage ${(editingQIndex ?? 0) + 1} bearbeiten`}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-blue-800 mb-1 block">Frage *</label>
            <textarea
              value={editingQuestion.text}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
              placeholder="Was war die erste Plage in Ägypten?"
              rows={3}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-800 mb-2 block">Antworten (Richtige markieren)</label>
            <div className="flex flex-col gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((label, i) => {
                const bgColors = ['bg-red-100', 'bg-blue-100', 'bg-yellow-100', 'bg-green-100'];
                const borderColors = ['border-red-300', 'border-blue-300', 'border-yellow-300', 'border-green-300'];
                const isCorrect = editingQuestion.correct === i;
                return (
                  <div key={i} className={`flex items-center gap-2 rounded-xl border p-2 transition-all ${isCorrect ? `${bgColors[i]} ${borderColors[i]}` : 'border-slate-200'}`}>
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...editingQuestion, correct: i as 0 | 1 | 2 | 3 })}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                        isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-slate-400 hover:border-green-400'
                      }`}
                    >
                      {label}
                    </button>
                    <input
                      type="text"
                      value={editingQuestion.answers[i]}
                      onChange={(e) => {
                        const newAnswers = [...editingQuestion.answers] as [string, string, string, string];
                        newAnswers[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, answers: newAnswers });
                      }}
                      placeholder={`Antwort ${label}`}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-blue-400 mt-1">Klicke auf den Buchstaben, um die richtige Antwort zu markieren</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-blue-800 mb-1 block">Zeitlimit (Sekunden)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={editingQuestion.timeLimit}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, timeLimit: Number(e.target.value) })}
                className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-800 mb-1 block">Erklärung (optional)</label>
            <input
              type="text"
              value={editingQuestion.explanation ?? ''}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
              placeholder="Bibelstelle oder Erklärung zur Antwort..."
              className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <button
          onClick={saveQuestion}
          disabled={!editingQuestion.text.trim() || editingQuestion.answers.some((a) => !a.trim())}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white font-bold px-6 py-3 rounded-2xl transition-colors active:scale-[0.97]"
        >
          Frage speichern
        </button>
      </div>
    );
  }

  // Set editor
  if (editingSet) {
    return (
      <div className="flex flex-col gap-4 page-enter">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setEditingSet(null)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← Zurück
          </button>
          <button
            onClick={saveEditingSet}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white text-sm font-bold px-4 py-2 rounded-xl active:scale-[0.97]"
          >
            {saving ? 'Speichert...' : '💾 Speichern'}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl py-2 px-4">{error}</p>}

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-4">
          <h2 className="font-bold text-slate-900 text-lg">Quiz-Set bearbeiten</h2>
          <div>
            <label className="text-sm font-semibold text-blue-800 mb-1 block">Titel *</label>
            <input
              type="text"
              value={editingSet.title}
              onChange={(e) => setEditingSet({ ...editingSet, title: e.target.value })}
              className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-blue-800 mb-1 block">Kategorie</label>
            <select
              value={editingSet.category}
              onChange={(e) => setEditingSet({ ...editingSet, category: e.target.value })}
              className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-blue-800 mb-1 block">Beschreibung</label>
            <input
              type="text"
              value={editingSet.description}
              onChange={(e) => setEditingSet({ ...editingSet, description: e.target.value })}
              className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-blue-800">Fragen ({editingSet.questions.length})</h3>
            <button
              onClick={openNewQuestion}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl active:scale-[0.97] transition-colors"
            >
              + Frage hinzufügen
            </button>
          </div>

          {editingSet.questions.length === 0 ? (
            <p className="text-blue-300 text-sm text-center py-4">Noch keine Fragen. Füge deine erste Frage hinzu!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {editingSet.questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                  <span className="text-blue-400 font-bold text-sm w-5 shrink-0 mt-0.5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{q.text || <span className="text-slate-300">Kein Text</span>}</p>
                    <p className="text-xs text-blue-400 mt-0.5">
                      Richtig: {q.answers[q.correct] || '—'} · {q.timeLimit}s
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openQuestion(q, i)}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteQuestion(i)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Set list view ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz-Sets</h1>
          <p className="text-blue-400 text-sm">{sets.length} Sets verfügbar</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/quiz"
            className="text-blue-400 hover:text-blue-600 text-sm px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            ← Quiz
          </Link>
          <button
            onClick={() => { setShowNewForm(true); setNewSetData(emptySet()); }}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl active:scale-[0.97] transition-colors"
          >
            + Neues Set
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl py-2 px-4">{error}</p>}

      {/* New set form */}
      {showNewForm && (
        <form
          onSubmit={handleCreateSet}
          className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 flex flex-col gap-4"
        >
          <h2 className="font-bold text-slate-900">Neues Quiz-Set erstellen</h2>
          <div>
            <label className="text-sm font-semibold text-blue-800 mb-1 block">Titel *</label>
            <input
              type="text"
              value={newSetData.title}
              onChange={(e) => setNewSetData({ ...newSetData, title: e.target.value })}
              placeholder="z.B. Psalmen Klassiker"
              className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-blue-800 mb-1 block">Kategorie</label>
            <select
              value={newSetData.category}
              onChange={(e) => setNewSetData({ ...newSetData, category: e.target.value })}
              className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-blue-800 mb-1 block">Beschreibung</label>
            <input
              type="text"
              value={newSetData.description}
              onChange={(e) => setNewSetData({ ...newSetData, description: e.target.value })}
              placeholder="Kurze Beschreibung..."
              className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !newSetData.title.trim()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white font-bold py-2 rounded-xl text-sm transition-colors active:scale-[0.97]"
            >
              {saving ? 'Erstellt...' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Sets list */}
      <div className="flex flex-col gap-3">
        {sets.map((set) => (
          <div
            key={set.id}
            className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[set.category] ?? 'bg-slate-100 text-slate-700'}`}>
                    {set.category}
                  </span>
                  <span className="text-xs text-blue-400">{set.questions.length} Fragen</span>
                  {set.id.startsWith('default-') && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Standard</span>
                  )}
                </div>
                <p className="font-bold text-slate-900 text-sm">{set.title}</p>
                {set.description && (
                  <p className="text-blue-400 text-xs mt-0.5 line-clamp-1">{set.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => setEditingSet({ ...set })}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1.5 rounded-lg transition-colors active:scale-[0.97]"
              >
                ✏️ Bearbeiten
              </button>
              <button
                onClick={() => handleDuplicateSet(set)}
                disabled={saving}
                className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium px-3 py-1.5 rounded-lg transition-colors active:scale-[0.97]"
              >
                📋 Duplizieren
              </button>
              <button
                onClick={() => handleDeleteSet(set.id)}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg transition-colors active:scale-[0.97]"
              >
                🗑️ Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
