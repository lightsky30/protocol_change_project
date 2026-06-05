"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, SecretNote, supabase } from "@/lib/supabase";
import {
  DEFAULT_LANGUAGE,
  Language,
  LANGUAGE_STORAGE_KEY,
  translations
} from "@/lib/i18n";

type LoadState = "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting" | "submitted";
type View = "reading" | "writing";

let initialClaimStarted = false;

export default function Home() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [view, setView] = useState<View>("reading");
  const [waitingNote, setWaitingNote] = useState<SecretNote | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [mood, setMood] = useState("");
  const [song, setSong] = useState("");
  const [leaving, setLeaving] = useState(false);
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

  function toggleLanguage() {
    const next: Language = language === "ko" ? "en" : "ko";
    setLanguage(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }

  // errorMessage holds a translation key so the text re-translates when the
  // language changes.
  function setError(key: keyof typeof translations.ko | "") {
    setErrorMessage(key);
  }

  async function claimWaitingNote() {
    if (!supabase) {
      setError("errNotConfigured");
      setLoadState("error");
      return;
    }

    setLoadState("loading");
    setError("");

    // The RPC deletes and returns one row in a single database operation,
    // so two visitors cannot read the same waiting note.
    const { data, error } = await supabase.rpc("claim_oldest_secret_note");

    if (error) {
      setWaitingNote(null);
      setError("errOpenBox");
      setLoadState("error");
      return;
    }

    setWaitingNote(data?.[0] ?? null);
    setLoadState("ready");
  }

  useEffect(() => {
    if (initialClaimStarted) return;
    initialClaimStarted = true;
    void claimWaitingNote();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittedRef.current || submitState === "submitting") return;

    const trimmedMood = mood.trim();
    const trimmedSong = song.trim();

    if (!trimmedMood || !trimmedSong) {
      setError("errNeedMoodSong");
      return;
    }

    if (!supabase) {
      setError("errNotConfigured");
      return;
    }

    submittedRef.current = true;
    setSubmitState("submitting");
    setError("");

    // A note is now just a mood + a song. The song lives in the required
    // `message` column so the existing NOT NULL constraint stays satisfied.
    const { error } = await supabase.from("secret_notes").insert({
      mood: trimmedMood,
      message: trimmedSong,
      music_title: null,
      music_url: null
    });

    if (error) {
      submittedRef.current = false;
      setSubmitState("idle");
      setError(error.code === "23505" ? "errAlreadyWaiting" : "errGeneric");
      return;
    }

    setSubmitState("submitted");
  }

  // Reading "consumes" the note: it tears off the wall like a peeled post-it
  // before the writing view opens.
  function goToWriting() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => {
      setError("");
      setView("writing");
      setLeaving(false);
    }, 620);
  }

  const resolvedError = errorMessage
    ? (t[errorMessage as keyof typeof t] as string) || ""
    : "";

  const toggle = (
    <LanguageToggle
      label={t.toggleLabel}
      ariaLabel={t.toggleAria}
      onToggle={toggleLanguage}
    />
  );

  if (submitState === "submitted") {
    return (
      <main className="page-shell">
        {toggle}
        <section className="paper confirmation" aria-live="polite">
          <span className="pin" aria-hidden="true" />
          <p className="eyebrow">{t.confirmEyebrow}</p>
          <h1 className="confirm-title">{t.confirmTitle}</h1>
          <p className="soft-copy">{t.confirmBody}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      {toggle}

      <section className="paper">
        <span className="pin" aria-hidden="true" />

        {view === "writing" ? (
          <>
            <button
              className="back-link"
              type="button"
              onClick={() => {
                setError("");
                setView("reading");
              }}
            >
              {t.back}
            </button>

            <form className="note-form" onSubmit={handleSubmit}>
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

              <label>
                <span>{t.songField}</span>
                <input
                  autoComplete="off"
                  maxLength={120}
                  onChange={(event) => setSong(event.target.value)}
                  placeholder={t.songPlaceholder}
                  required
                  value={song}
                />
              </label>

              {resolvedError && (
                <p className="form-error" role="alert">
                  {resolvedError}
                </p>
              )}

              <button
                className="submit-button"
                disabled={!isSupabaseConfigured || submitState === "submitting"}
                type="submit"
              >
                {submitState === "submitting" ? t.pinning : t.pinButton}
              </button>
            </form>
          </>
        ) : (
          <div className={`reading-content${leaving ? " leaving" : ""}`}>
            <header className="intro">
              <p className="eyebrow">{t.eyebrow}</p>
              <h1>{t.introTitle}</h1>
              <p className="intro-body">{t.introBody}</p>
            </header>

            {loadState === "loading" && (
              <div className="status-card" aria-live="polite">
                <span className="pulse-dot" aria-hidden="true" />
                {t.looking}
              </div>
            )}

            {loadState === "error" && (
              <div className="status-card warning" role="alert">
                <p>{t.errorTitle}</p>
                <button
                  className="quiet-button"
                  type="button"
                  onClick={claimWaitingNote}
                >
                  {t.retry}
                </button>
              </div>
            )}

            {loadState === "ready" && (
              <>
                {waitingNote ? (
                  <PreviousNote note={waitingNote} t={t} />
                ) : (
                  <div className="status-card empty-state">
                    <p>{t.emptyWall}</p>
                  </div>
                )}

                <button
                  className="submit-button advance-button"
                  type="button"
                  onClick={goToWriting}
                >
                  {t.goWrite}
                </button>
              </>
            )}
          </div>
        )}
      </section>
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

function PreviousNote({
  note,
  t
}: {
  note: SecretNote;
  t: (typeof translations)[Language];
}) {
  // New notes store the song in `message`; older notes may still have it in
  // `music_title`. Prefer whichever holds the song.
  const songText = note.music_title || note.message;

  return (
    <article className="previous-note">
      <p className="note-eyebrow">{t.someoneWasHere}</p>
      <p className="note-mood">
        <span className="sr-only">{t.moodLabel}: </span>
        {note.mood}
      </p>
      {songText && (
        <p className="note-song">
          <span className="note-mark" aria-hidden="true">♪</span>
          <span className="sr-only">{t.songLabel}: </span>
          {songText}
        </p>
      )}
      <p className="disappeared">{t.disappeared}</p>
    </article>
  );
}
