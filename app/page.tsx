"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { MusicResult } from "@/app/api/music/search/route";
import { isSupabaseConfigured, SecretNote, supabase } from "@/lib/supabase";
import {
  DEFAULT_LANGUAGE,
  Language,
  LANGUAGE_STORAGE_KEY,
  translations
} from "@/lib/i18n";

type LoadState = "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting";
type SearchState = "idle" | "searching" | "done";

// Error keys are the subset of copy that holds a plain string message.
type ErrorKey =
  | "errNotConfigured"
  | "errLoadWall"
  | "errNeedMoodSong"
  | "errGeneric"
  | "";

// How many notes to pull per page when loading the wall.
const PAGE_SIZE = 60;

let initialLoadStarted = false;

export default function Home() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [notes, setNotes] = useState<SecretNote[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState<ErrorKey>("");

  // compose modal
  const [composeOpen, setComposeOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [formError, setFormError] = useState<ErrorKey>("");
  const [mood, setMood] = useState("");
  const [songQuery, setSongQuery] = useState("");
  const [songResults, setSongResults] = useState<MusicResult[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [selectedSong, setSelectedSong] = useState<MusicResult | null>(null);
  const submittedRef = useRef(false);

  const t = translations[language];

  // Restore the saved language so the choice persists during navigation.
  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "ko" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Debounced song search. Once a song is selected, searching pauses so the
  // chosen result stays put; clearing the selection resumes it.
  useEffect(() => {
    const trimmed = songQuery.trim();

    if (selectedSong || trimmed.length < 2) {
      setSongResults([]);
      setSearchState("idle");
      return;
    }

    setSearchState("searching");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/music/search?term=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as { results?: MusicResult[] };
        setSongResults(data.results ?? []);
        setSearchState("done");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSongResults([]);
        setSearchState("done");
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [songQuery, selectedSong]);

  function toggleLanguage() {
    const next: Language = language === "ko" ? "en" : "ko";
    setLanguage(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }

  // Load a page of notes. `from === 0` replaces the wall; otherwise it appends
  // older notes, de-duplicating by id so an optimistically-added note can't
  // show up twice.
  const loadNotes = useCallback(async (from: number) => {
    if (!supabase) {
      setLoadError("errNotConfigured");
      setLoadState("error");
      return;
    }

    if (from === 0) setLoadState("loading");
    setLoadError("");

    const { data, error } = await supabase
      .from("secret_notes")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      setLoadError("errLoadWall");
      if (from === 0) setLoadState("error");
      return;
    }

    const rows = data ?? [];
    setNotes((prev) => {
      if (from === 0) return rows;
      const seen = new Set(prev.map((note) => note.id));
      return [...prev, ...rows.filter((note) => !seen.has(note.id))];
    });
    setHasMore(rows.length === PAGE_SIZE);
    setLoadState("ready");
  }, []);

  useEffect(() => {
    if (initialLoadStarted) return;
    initialLoadStarted = true;
    void loadNotes(0);
  }, [loadNotes]);

  function openCompose() {
    setFormError("");
    setComposeOpen(true);
  }

  function closeCompose() {
    if (submitState === "submitting") return;
    setComposeOpen(false);
  }

  // Close the modal on Escape for keyboard users.
  useEffect(() => {
    if (!composeOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeCompose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeOpen, submitState]);

  function resetForm() {
    submittedRef.current = false;
    setMood("");
    setSongQuery("");
    setSelectedSong(null);
    setSongResults([]);
    setSearchState("idle");
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittedRef.current || submitState === "submitting") return;

    const trimmedMood = mood.trim();

    if (!trimmedMood || !selectedSong) {
      setFormError("errNeedMoodSong");
      return;
    }

    if (!supabase) {
      setFormError("errNotConfigured");
      return;
    }

    submittedRef.current = true;
    setSubmitState("submitting");
    setFormError("");

    // A note is a mood + a song picked from search. The display text also goes
    // into the required `message` column so the NOT NULL constraint holds, and
    // the structured title/url are kept for richer rendering and linking.
    const songTitle = `${selectedSong.title} — ${selectedSong.artist}`;
    const { data, error } = await supabase
      .from("secret_notes")
      .insert({
        mood: trimmedMood,
        message: songTitle,
        music_title: songTitle,
        music_url: selectedSong.url || null
      })
      .select()
      .single();

    if (error || !data) {
      submittedRef.current = false;
      setSubmitState("idle");
      setFormError("errGeneric");
      return;
    }

    // Pin the new note to the top of the wall right away.
    setNotes((prev) => [data, ...prev]);
    setSubmitState("idle");
    setComposeOpen(false);
    resetForm();
  }

  const resolvedFormError = formError ? (t[formError] as string) : "";

  const toggle = (
    <LanguageToggle
      label={t.toggleLabel}
      ariaLabel={t.toggleAria}
      onToggle={toggleLanguage}
    />
  );

  return (
    <main className="wall-shell">
      {toggle}

      <header className="wall-header">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="wall-intro">{t.intro}</h1>
        {loadState === "ready" && notes.length > 0 && (
          <p className="wall-count">{t.countLabel(notes.length)}</p>
        )}
      </header>

      {loadState === "loading" && (
        <div className="status-card" aria-live="polite">
          <span className="pulse-dot" aria-hidden="true" />
          {t.looking}
        </div>
      )}

      {loadState === "error" && (
        <div className="status-card warning" role="alert">
          <p>{loadError ? (t[loadError] as string) : t.errorTitle}</p>
          <button
            className="quiet-button"
            type="button"
            onClick={() => loadNotes(0)}
          >
            {t.retry}
          </button>
        </div>
      )}

      {loadState === "ready" &&
        (notes.length > 0 ? (
          <>
            <section className="note-grid" aria-label={t.eyebrow}>
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} t={t} />
              ))}
            </section>

            {hasMore && (
              <button
                className="quiet-button load-more"
                type="button"
                onClick={() => loadNotes(notes.length)}
              >
                {t.loadMore}
              </button>
            )}
          </>
        ) : (
          <div className="status-card empty-state">
            <p>{t.emptyWall}</p>
          </div>
        ))}

      <button
        className="compose-fab"
        type="button"
        onClick={openCompose}
        disabled={!isSupabaseConfigured}
      >
        <span className="compose-fab-mark" aria-hidden="true">
          ✎
        </span>
        {t.openCompose}
      </button>

      {composeOpen && (
        <ComposeModal
          t={t}
          mood={mood}
          setMood={setMood}
          songQuery={songQuery}
          setSongQuery={setSongQuery}
          songResults={songResults}
          searchState={searchState}
          selectedSong={selectedSong}
          setSelectedSong={setSelectedSong}
          submitState={submitState}
          error={resolvedFormError}
          clearError={() => setFormError("")}
          onClose={closeCompose}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}

function LanguageToggle({
  label,
  ariaLabel,
  onToggle
}: {
  label: string;
  ariaLabel: string;
  onToggle: () => void;
}) {
  return (
    <button
      className="language-toggle"
      type="button"
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}

// A small deterministic tilt so each pinned note leans slightly differently
// while staying stable across re-renders.
function tiltFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const deg = ((hash % 500) / 100 - 2.5).toFixed(2);
  const tint = hash % 4;
  return { deg, tint };
}

function NoteCard({
  note,
  t
}: {
  note: SecretNote;
  t: (typeof translations)[Language];
}) {
  // New notes store the song in `music_title`; older notes may still have it
  // in `message`. Prefer whichever holds the song.
  const songText = note.music_title || note.message;
  const { deg, tint } = tiltFor(note.id);

  return (
    <article
      className="note-card"
      data-tint={tint}
      style={{ ["--tilt" as string]: `${deg}deg` }}
    >
      <span className="note-tape" aria-hidden="true" />
      <p className="note-mood">
        <span className="sr-only">{t.moodLabel}: </span>
        {note.mood}
      </p>
      {songText && (
        <p className="note-song">
          <span className="note-mark" aria-hidden="true">
            ♪
          </span>
          <span className="sr-only">{t.songLabel}: </span>
          {note.music_url ? (
            <a
              className="note-song-link"
              href={note.music_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {songText}
            </a>
          ) : (
            songText
          )}
        </p>
      )}
    </article>
  );
}

function ComposeModal({
  t,
  mood,
  setMood,
  songQuery,
  setSongQuery,
  songResults,
  searchState,
  selectedSong,
  setSelectedSong,
  submitState,
  error,
  clearError,
  onClose,
  onSubmit
}: {
  t: (typeof translations)[Language];
  mood: string;
  setMood: (value: string) => void;
  songQuery: string;
  setSongQuery: (value: string) => void;
  songResults: MusicResult[];
  searchState: SearchState;
  selectedSong: MusicResult | null;
  setSelectedSong: (song: MusicResult | null) => void;
  submitState: SubmitState;
  error: string;
  clearError: () => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="compose-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="compose-modal paper"
        role="dialog"
        aria-modal="true"
        aria-label={t.formTitle}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="pin" aria-hidden="true" />

        <button
          className="back-link compose-close"
          type="button"
          onClick={onClose}
        >
          {t.closeCompose}
        </button>

        <form className="note-form" onSubmit={onSubmit}>
          <div className="form-heading">
            <h2>{t.formTitle}</h2>
            <p>{t.formSubtitle}</p>
          </div>

          <label>
            <span>{t.moodField}</span>
            <input
              autoComplete="off"
              maxLength={80}
              onChange={(event) => setMood(event.target.value)}
              placeholder={t.moodPlaceholder}
              required
              value={mood}
            />
          </label>

          <div className="song-field">
            <span className="song-field-label">{t.songField}</span>

            {selectedSong ? (
              <div className="selected-song">
                {selectedSong.artwork && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="song-art"
                    src={selectedSong.artwork}
                    alt=""
                    width={48}
                    height={48}
                  />
                )}
                <span className="song-meta">
                  <span className="song-title">{selectedSong.title}</span>
                  <span className="song-artist">{selectedSong.artist}</span>
                </span>
                <button
                  className="song-clear"
                  type="button"
                  onClick={() => {
                    setSelectedSong(null);
                    setSongQuery("");
                  }}
                >
                  {t.clearSong}
                </button>
              </div>
            ) : (
              <>
                <input
                  autoComplete="off"
                  maxLength={120}
                  onChange={(event) => setSongQuery(event.target.value)}
                  placeholder={t.songPlaceholder}
                  value={songQuery}
                />

                {searchState === "searching" && (
                  <p className="song-status">{t.searching}</p>
                )}

                {searchState === "done" && songResults.length === 0 && (
                  <p className="song-status">{t.noResults}</p>
                )}

                {songResults.length > 0 && (
                  <ul className="song-results">
                    {songResults.map((result) => (
                      <li key={result.id}>
                        <button
                          className="song-result"
                          type="button"
                          onClick={() => {
                            setSelectedSong(result);
                            clearError();
                          }}
                        >
                          {result.artwork && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className="song-art"
                              src={result.artwork}
                              alt=""
                              width={40}
                              height={40}
                            />
                          )}
                          <span className="song-meta">
                            <span className="song-title">{result.title}</span>
                            <span className="song-artist">{result.artist}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="submit-button"
            disabled={
              !isSupabaseConfigured ||
              submitState === "submitting" ||
              !mood.trim() ||
              !selectedSong
            }
            type="submit"
          >
            {submitState === "submitting" ? t.pinning : t.pinButton}
          </button>
        </form>
      </div>
    </div>
  );
}
