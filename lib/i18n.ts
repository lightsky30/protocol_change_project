export type Language = "ko" | "en";

export const DEFAULT_LANGUAGE: Language = "ko";
export const LANGUAGE_STORAGE_KEY = "wall-note-language";

type Copy = {
  // language toggle
  toggleAria: string;
  toggleLabel: string;
  // intro
  eyebrow: string;
  introTitle: string;
  introBody: string;
  // load states
  looking: string;
  errorTitle: string;
  retry: string;
  // previous note
  someoneWasHere: string;
  moodLabel: string;
  songLabel: string;
  noSong: string;
  disappeared: string;
  emptyWall: string;
  // reading -> writing step
  goWrite: string;
  back: string;
  // form
  formTitle: string;
  formSubtitle: string;
  moodField: string;
  moodPlaceholder: string;
  songField: string;
  songPlaceholder: string;
  pinButton: string;
  pinning: string;
  // confirmation
  confirmEyebrow: string;
  confirmTitle: string;
  confirmBody: string;
  // errors
  errNotConfigured: string;
  errOpenBox: string;
  errNeedMoodSong: string;
  errAlreadyWaiting: string;
  errGeneric: string;
};

export const translations: Record<Language, Copy> = {
  ko: {
    toggleAria: "언어 바꾸기",
    toggleLabel: "EN",
    eyebrow: "조용한 벽 한 켠",
    introTitle: "당신은 이곳을 발견했어요.",
    introBody: "쪽지는 하나만 머물고, 읽히면 사라집니다.",
    looking: "쪽지를 찾는 중…",
    errorTitle: "쪽지함을 열 수 없었어요. 잠시 뒤 다시 시도해 주세요.",
    retry: "다시 시도하기",
    someoneWasHere: "누군가 먼저 다녀갔어요",
    moodLabel: "기분",
    songLabel: "노래",
    noSong: "노래는 없어요",
    disappeared: "이 쪽지는 사라졌어요.",
    emptyWall: "아직 이 벽엔 쪽지가 없어요. 당신이 처음이에요.",
    goWrite: "다음 쪽지 남기기",
    back: "← 돌아가기",
    formTitle: "한 장 남겨 주세요.",
    formSubtitle: "읽히면 사라집니다.",
    moodField: "기분",
    moodPlaceholder: "지금 기분은?",
    songField: "노래",
    songPlaceholder: "듣고 있는 노래는?",
    pinButton: "벽에 붙이기",
    pinning: "벽에 붙이는 중…",
    confirmEyebrow: "남겨졌어요",
    confirmTitle: "당신의 쪽지가 이제 다음 사람을 기다려요.",
    confirmBody: "이 페이지를 닫아도 좋아요. 벽 한 켠은 다시 조용해졌어요.",
    errNotConfigured: "아직 연결이 준비되지 않았어요.",
    errOpenBox: "쪽지함을 열 수 없었어요. 잠시 뒤 조용히 다시 시도해 주세요.",
    errNeedMoodSong: "기분과 노래를 남겨 주세요.",
    errAlreadyWaiting:
      "다른 쪽지가 이미 기다리고 있어요. 새로고침하면 다시 열 수 있어요.",
    errGeneric: "쪽지를 남기지 못했어요. 다시 시도해 주세요."
  },
  en: {
    toggleAria: "Change language",
    toggleLabel: "한국어",
    eyebrow: "a quiet corner of the wall",
    introTitle: "You found this place.",
    introBody: "One note rests here. Once read, it disappears.",
    looking: "Looking for a note…",
    errorTitle: "The note box couldn't be opened. Try again in a moment.",
    retry: "Try again",
    someoneWasHere: "someone was here before you",
    moodLabel: "mood",
    songLabel: "song",
    noSong: "no song",
    disappeared: "This note is gone now.",
    emptyWall: "No note on this wall yet. You're the first.",
    goWrite: "leave the next note",
    back: "← go back",
    formTitle: "Leave one note.",
    formSubtitle: "Once read, it disappears.",
    moodField: "mood",
    moodPlaceholder: "how do you feel?",
    songField: "song",
    songPlaceholder: "what's playing?",
    pinButton: "pin it to the wall",
    pinning: "pinning it up…",
    confirmEyebrow: "left behind",
    confirmTitle: "Your note now waits for the next person.",
    confirmBody: "You can close this page. The corner is quiet again.",
    errNotConfigured: "The connection isn't ready yet.",
    errOpenBox: "The note box couldn't be opened. Try again quietly in a moment.",
    errNeedMoodSong: "Leave a mood and a song.",
    errAlreadyWaiting:
      "Another note is already waiting. Refresh to open the wall again.",
    errGeneric: "Your note couldn't be left here. Please try again."
  }
};
