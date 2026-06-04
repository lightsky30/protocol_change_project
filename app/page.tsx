"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, SecretNote, supabase } from "@/lib/supabase";

type LoadState = "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting" | "submitted";

const MESSAGE_LIMIT = 200;
let initialClaimStarted = false;

export default function Home() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [waitingNote, setWaitingNote] = useState<SecretNote | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const submittedRef = useRef(false);

  async function claimWaitingNote() {
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      setLoadState("error");
      return;
    }

    setLoadState("loading");
    setErrorMessage("");

    // The RPC deletes and returns one row in a single database operation,
    // so two visitors cannot read the same waiting note.
    const { data, error } = await supabase.rpc("claim_oldest_secret_note");

    if (error) {
      setWaitingNote(null);
      setErrorMessage("The message box could not be opened. Try again quietly.");
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
    const trimmedMessage = message.trim();
    const trimmedMusicTitle = musicTitle.trim();
    const trimmedMusicUrl = musicUrl.trim();

    if (!trimmedMood || !trimmedMessage) {
      setErrorMessage("Leave at least a mood and a message.");
      return;
    }

    if (trimmedMessage.length > MESSAGE_LIMIT) {
      setErrorMessage(`Keep the message under ${MESSAGE_LIMIT} characters.`);
      return;
    }

    if (trimmedMusicUrl) {
      try {
        new URL(trimmedMusicUrl);
      } catch {
        setErrorMessage("The music URL does not look valid.");
        return;
      }
    }

    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    submittedRef.current = true;
    setSubmitState("submitting");
    setErrorMessage("");

    const { error } = await supabase.from("secret_notes").insert({
      mood: trimmedMood,
      message: trimmedMessage,
      music_title: trimmedMusicTitle || null,
      music_url: trimmedMusicUrl || null
    });

    if (error) {
      submittedRef.current = false;
      setSubmitState("idle");
      setErrorMessage(
        error.code === "23505"
          ? "Another message is already waiting. Refresh to open the box again."
          : "Your message could not be left here. Please try again."
      );
      return;
    }

    setSubmitState("submitted");
  }

  if (submitState === "submitted") {
    return (
      <main className="page-shell">
        <section className="panel confirmation-panel" aria-live="polite">
          <p className="eyebrow">left behind</p>
          <h1>Your message is now waiting for the next person.</h1>
          <p className="soft-copy">
            Close this page. The corner is quiet again.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <header className="intro">
          <p className="eyebrow">staircase corner</p>
          <h1>You found this place.</h1>
          <p>
            This is a message box for the staircase corner. One message waits
            here. One person reads it. Then it disappears.
          </p>
        </header>

        {loadState === "loading" && (
          <div className="status-card" aria-live="polite">
            <span className="pulse-dot" aria-hidden="true" />
            Looking for a message...
          </div>
        )}

        {loadState === "error" && (
          <div className="status-card warning" role="alert">
            <p>{errorMessage}</p>
            <button className="quiet-button" type="button" onClick={claimWaitingNote}>
              Try again
            </button>
          </div>
        )}

        {loadState === "ready" && (
          <>
            {waitingNote ? (
              <PreviousNote note={waitingNote} />
            ) : (
              <div className="status-card empty-state">
                <p>There is no message waiting here yet.</p>
              </div>
            )}

            <form className="note-form" onSubmit={handleSubmit}>
              <div className="form-heading">
                <h2>Leave one for the next person.</h2>
                <p>No name. No archive. Just this moment.</p>
              </div>

              <label>
                <span>current mood</span>
                <input
                  autoComplete="off"
                  maxLength={80}
                  onChange={(event) => setMood(event.target.value)}
                  placeholder="quiet, tired, curious..."
                  required
                  value={mood}
                />
              </label>

              <label>
                <span>short message</span>
                <textarea
                  maxLength={MESSAGE_LIMIT}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="write something small"
                  required
                  rows={5}
                  value={message}
                />
              </label>
              <p className="character-count">
                {message.length}/{MESSAGE_LIMIT}
              </p>

              <label>
                <span>song title</span>
                <input
                  autoComplete="off"
                  maxLength={120}
                  onChange={(event) => setMusicTitle(event.target.value)}
                  placeholder="what are you listening to?"
                  value={musicTitle}
                />
              </label>

              <label>
                <span>music URL, optional</span>
                <input
                  autoComplete="off"
                  inputMode="url"
                  onChange={(event) => setMusicUrl(event.target.value)}
                  placeholder="https://..."
                  type="url"
                  value={musicUrl}
                />
              </label>

              {errorMessage && (
                <p className="form-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                className="submit-button"
                disabled={!isSupabaseConfigured || submitState === "submitting"}
                type="submit"
              >
                {submitState === "submitting" ? "leaving it here..." : "leave message"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function PreviousNote({ note }: { note: SecretNote }) {
  return (
    <article className="previous-note">
      <p className="eyebrow">someone was here</p>
      <dl>
        <div>
          <dt>mood</dt>
          <dd>{note.mood}</dd>
        </div>
        <div>
          <dt>message</dt>
          <dd>{note.message}</dd>
        </div>
        <div>
          <dt>music</dt>
          <dd>
            {note.music_url ? (
              <a href={note.music_url} rel="noreferrer" target="_blank">
                {note.music_title || "open song"}
              </a>
            ) : (
              note.music_title || "no song was left"
            )}
          </dd>
        </div>
      </dl>
      <p className="disappeared">This message has now disappeared.</p>
    </article>
  );
}
