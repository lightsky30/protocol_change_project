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
    introBody:
      "이 벽에는 쪽지가 한 장만 머물러요. 한 사람이 그것을 읽고 나면, 쪽지는 조용히 사라져요. 그리고 당신은 다음 사람을 위해 새 쪽지를 남길 수 있어요.",
    looking: "남겨진 쪽지를 찾는 중…",
    errorTitle: "쪽지함을 열 수 없었어요. 잠시 뒤 조용히 다시 시도해 주세요.",
    retry: "다시 시도하기",
    someoneWasHere: "누군가 먼저 다녀갔어요",
    moodLabel: "그때의 기분",
    songLabel: "그때 듣던 노래",
    noSong: "남겨진 노래는 없어요",
    disappeared: "이 쪽지는 이제 사라졌어요.",
    emptyWall: "아직 이 벽에는 아무 쪽지도 없어요. 당신이 첫 번째예요.",
    goWrite: "내 쪽지 남기러 가기",
    back: "← 돌아가기",
    formTitle: "다음 사람을 위해 한 장 남겨 주세요.",
    formSubtitle: "이름도, 기록도 없어요. 오직 지금 이 순간뿐.",
    moodField: "지금의 기분",
    moodPlaceholder: "고요해요, 지쳤어요, 설레요…",
    songField: "노래 제목 / 가수",
    songPlaceholder: "어떤 노래를 듣고 있나요?",
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
    introBody:
      "Only one note rests on this wall at a time. Once a person reads it, the note quietly disappears. Then you may leave a new one for whoever comes next.",
    looking: "Looking for a note left behind…",
    errorTitle: "The note box couldn't be opened. Try again quietly in a moment.",
    retry: "Try again",
    someoneWasHere: "someone was here before you",
    moodLabel: "their mood",
    songLabel: "the song they were playing",
    noSong: "no song was left",
    disappeared: "This note has now disappeared.",
    emptyWall: "There is no note on this wall yet. You are the first.",
    goWrite: "leave my own note",
    back: "← go back",
    formTitle: "Leave one for the next person.",
    formSubtitle: "No name. No archive. Just this moment.",
    moodField: "your mood right now",
    moodPlaceholder: "quiet, tired, curious…",
    songField: "song title / artist",
    songPlaceholder: "what are you listening to?",
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
