// TypeScript type definitions for the Speed Reader application

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author?: string;
  file_type?: string;
  file_size?: number;
  content: string;
  word_count?: number;
  genre?: string;
  background_theme?: {
    type: 'gradient' | 'image' | 'pattern';
    colors?: string[];
    imageUrl?: string;
    patternType?: string;
    overlayIntensity?: number;
  };
  created_at: string;
  current_position?: number;
  completed?: boolean;
  last_read_at?: string;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  default_wpm: number;
  red_letter_position: 'first' | 'middle' | 'last' | 'random';
  font_size: number;
  theme: string;
  color_scheme: {
    text: string;
    background: string;
    highlight: string;
  };
  pause_on_punctuation: boolean;
  background_overlay_intensity: number;
  created_at: string;
  updated_at: string;
}

export interface UserStatistics {
  id: number;
  user_id: number;
  total_words_read: number;
  total_books_completed: number;
  total_reading_time: number;
  average_wpm: number;
  current_streak: number;
  longest_streak: number;
  last_read_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingSession {
  id: number;
  user_id: number;
  book_id: number;
  start_time: string;
  end_time?: string;
  words_read?: number;
  average_wpm?: number;
  session_duration?: number;
}

export interface ReadingGoal {
  id: number;
  user_id: number;
  goal_type: 'words_per_day' | 'words_per_week' | 'books_per_month' | 'minutes_per_day';
  target_value: number;
  current_value: number;
  period: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  completed: boolean;
  created_at: string;
}

export interface Bookmark {
  id: number;
  user_id: number;
  book_id: number;
  word_position: number;
  note?: string;
  created_at: string;
  book_title?: string;
}

export interface RSVPReaderState {
  currentWordIndex: number;
  isPlaying: boolean;
  wpm: number;
  currentBook: Book | null;
  preferences: UserPreferences | null;
  sessionStartTime: Date | null;
  wordsReadInSession: number;
  setCurrentWordIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setWpm: (wpm: number) => void;
  setCurrentBook: (book: Book | null) => void;
  setPreferences: (preferences: UserPreferences | null) => void;
  startSession: () => void;
  endSession: () => { startTime: Date; wordsRead: number };
  incrementWordsRead: () => void;
  resetSession: () => void;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}