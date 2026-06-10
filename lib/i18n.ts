export type Language = "ko" | "en";

export const DEFAULT_LANGUAGE: Language = "ko";
export const LANGUAGE_STORAGE_KEY = "wall-note-language";

type Copy = {
  // language toggle
  toggleAria: string;
  toggleLabel: string;
  // intro / wall header
  eyebrow: string;
  introTitle: string;
  introBody: string;
  // wall states
  looking: string;
  errorTitle: string;
  retry: string;
  emptyWall: string;
  countLabel: (n: number) => string;
  loadMore: string;
  // note labels (screen-reader)
  moodLabel: string;
  songLabel: string;
  // compose
  openCompose: string;
  closeCompose: string;
  formTitle: string;
  formSubtitle: string;
  moodField: string;
  moodPlaceholder: string;
  songField: string;
  songPlaceholder: string;
  searching: string;
  noResults: string;
  clearSong: string;
  pinButton: string;
  pinning: string;
  // errors
  errNotConfigured: string;
  errLoadWall: string;
  errNeedMoodSong: string;
  errGeneric: string;
};

export const translations: Record<Language, Copy> = {
  ko: {
    toggleAria: "언어 바꾸기",
    toggleLabel: "EN",
    eyebrow: "모두가 남긴 응원의 벽",
    introTitle: "여기 모인 한 마디와 음악",
    introBody:
      "앞서 다녀간 사람들이 남긴 응원과 음악이 그대로 붙어 있어요. 당신의 한 마디도 더해 주세요.",
    looking: "벽을 불러오는 중…",
    errorTitle: "벽을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.",
    retry: "다시 시도하기",
    emptyWall: "아직 남겨진 응원이 없어요. 당신이 처음으로 남겨 보세요.",
    countLabel: (n) => `지금까지 ${n}개의 응원이 모였어요`,
    loadMore: "이전 응원 더 보기",
    moodLabel: "응원 한 마디",
    songLabel: "음악",
    openCompose: "나도 한 마디 남기기",
    closeCompose: "닫기",
    formTitle: "다음 사람에게 남기는 한 마디",
    formSubtitle: "당신의 응원과 음악이 벽에 함께 붙어요.",
    moodField: "응원 한 마디",
    moodPlaceholder: "시험 잘 보라고, 따뜻한 한 마디…",
    songField: "힘이 되는 노래",
    songPlaceholder: "힘이 되는 노래를 검색하세요",
    searching: "찾는 중…",
    noResults: "검색 결과가 없어요.",
    clearSong: "다시 고르기",
    pinButton: "벽에 붙이기",
    pinning: "붙이는 중…",
    errNotConfigured: "아직 연결이 준비되지 않았어요.",
    errLoadWall: "벽을 불러올 수 없었어요. 잠시 뒤 다시 시도해 주세요.",
    errNeedMoodSong: "응원 한 마디와 노래를 남겨 주세요.",
    errGeneric: "응원을 남기지 못했어요. 다시 시도해 주세요."
  },
  en: {
    toggleAria: "Change language",
    toggleLabel: "한국어",
    eyebrow: "a wall of everyone's notes",
    introTitle: "Words and music, left here together",
    introBody:
      "Every word of luck and song left by the people before you stays pinned here. Add yours to the wall.",
    looking: "Loading the wall…",
    errorTitle: "Couldn't load the wall. Try again in a moment.",
    retry: "Try again",
    emptyWall: "No notes here yet. Be the first to leave one.",
    countLabel: (n) => `${n} ${n === 1 ? "note" : "notes"} so far`,
    loadMore: "Show earlier notes",
    moodLabel: "a word of luck",
    songLabel: "music",
    openCompose: "leave your note too",
    closeCompose: "close",
    formTitle: "A word for the next person",
    formSubtitle: "Your note and song get pinned to the wall.",
    moodField: "a word of luck",
    moodPlaceholder: "a warm word — good luck on your exam…",
    songField: "a song to keep you going",
    songPlaceholder: "search a song that gives strength",
    searching: "searching…",
    noResults: "No results found.",
    clearSong: "pick again",
    pinButton: "pin it to the wall",
    pinning: "pinning it up…",
    errNotConfigured: "The connection isn't ready yet.",
    errLoadWall: "The wall couldn't be loaded. Try again in a moment.",
    errNeedMoodSong: "Leave a word of luck and a song.",
    errGeneric: "Your note couldn't be left here. Please try again."
  }
};
