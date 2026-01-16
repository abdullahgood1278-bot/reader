export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Book {
  id: number;
  user_id: number;
  title: string;
  author?: string;
  file_type: string;
  word_count: number;
  genre?: string;
  background_theme?: BackgroundTheme;
  created_at: string;
  current_position?: number;
  completed?: boolean;
  last_read_at?: string;
  content?: string;
}

export interface BackgroundTheme {
  type: 'gradient' | 'image' | 'pattern';
  colors?: string[];
  imageUrl?: string;
  patternType?: string;
  overlayIntensity?: number;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  default_wpm: number;
  red_letter_position: 'first' | 'middle' | 'random' | 'last';
  font_size: number;
  theme: 'dark' | 'light' | 'sepia' | 'custom';
  color_scheme: ColorScheme;
  pause_on_punctuation: boolean;
  background_overlay_intensity: number;
  created_at: string;
  updated_at: string;
}

export interface ColorScheme {
  text: string;
  background: string;
  highlight: string;
}

export interface ReadingSession {
  id: number;
  user_id: number;
  book_id: number;
  book_title?: string;
  start_time: string;
  end_time?: string;
  words_read: number;
  average_wpm: number;
  session_duration: number;
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

export interface ReadingGoal {
  id: number;
  user_id: number;
  goal_type: 'words' | 'books' | 'time' | 'streak';
  target_value: number;
  current_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  completed: boolean;
  created_at: string;
}

export interface Bookmark {
  id: number;
  user_id: number;
  book_id: number;
  book_title?: string;
  word_position: number;
  note?: string;
  created_at: string;
}
