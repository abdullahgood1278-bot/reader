export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Book {
  id: number;
  user_id: number;
  title: string;
  author?: string;
  file_path?: string;
  file_type: string;
  file_size: number;
  content: string;
  word_count: number;
  genre?: string;
  cover_image_url?: string;
  background_theme?: BackgroundTheme;
  created_at: Date;
  updated_at: Date;
}

export interface BackgroundTheme {
  type: 'gradient' | 'image' | 'pattern';
  colors?: string[];
  imageUrl?: string;
  patternType?: string;
  overlayIntensity?: number;
}

export interface ReadingProgress {
  id: number;
  user_id: number;
  book_id: number;
  current_position: number;
  total_words: number;
  last_read_at: Date;
  completed: boolean;
}

export interface ReadingSession {
  id: number;
  user_id: number;
  book_id: number;
  start_time: Date;
  end_time?: Date;
  words_read: number;
  average_wpm: number;
  session_duration: number;
}

export interface Bookmark {
  id: number;
  user_id: number;
  book_id: number;
  word_position: number;
  note?: string;
  created_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface ColorScheme {
  text: string;
  background: string;
  highlight: string;
}

export interface ReadingGoal {
  id: number;
  user_id: number;
  goal_type: 'words' | 'books' | 'time' | 'streak';
  target_value: number;
  current_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: Date;
  end_date: Date;
  completed: boolean;
  created_at: Date;
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
  last_read_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}
