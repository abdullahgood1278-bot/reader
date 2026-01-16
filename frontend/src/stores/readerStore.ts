import { create } from 'zustand';
import type { Book, UserPreferences } from '../types';

interface ReaderState {
  currentBook: Book | null;
  currentWordIndex: number;
  isPlaying: boolean;
  wpm: number;
  preferences: UserPreferences | null;
  sessionStartTime: Date | null;
  wordsReadInSession: number;
  
  setCurrentBook: (book: Book | null) => void;
  setCurrentWordIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setWpm: (wpm: number) => void;
  setPreferences: (preferences: UserPreferences) => void;
  startSession: () => void;
  endSession: () => { startTime: Date; wordsRead: number };
  incrementWordsRead: () => void;
  reset: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBook: null,
  currentWordIndex: 0,
  isPlaying: false,
  wpm: 300,
  preferences: null,
  sessionStartTime: null,
  wordsReadInSession: 0,
  
  setCurrentBook: (book: Book | null) => set({ currentBook: book, currentWordIndex: book?.current_position || 0 }),
  
  setCurrentWordIndex: (index: number) => set({ currentWordIndex: index }),
  
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  
  setWpm: (wpm: number) => set({ wpm: Math.max(100, Math.min(1000, wpm)) }),
  
  setPreferences: (preferences: UserPreferences) => set({ preferences, wpm: preferences.default_wpm }),
  
  startSession: () => set({ sessionStartTime: new Date(), wordsReadInSession: 0 }),
  
  endSession: () => {
    const state = get();
    const result = {
      startTime: state.sessionStartTime || new Date(),
      wordsRead: state.wordsReadInSession,
    };
    set({ sessionStartTime: null, wordsReadInSession: 0 });
    return result;
  },
  
  incrementWordsRead: () => set((state) => ({ wordsReadInSession: state.wordsReadInSession + 1 })),
  
  reset: () => set({
    currentBook: null,
    currentWordIndex: 0,
    isPlaying: false,
    sessionStartTime: null,
    wordsReadInSession: 0,
  }),
}));
