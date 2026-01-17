import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useReaderStore } from '../../stores/readerStore';
import { booksAPI, statisticsAPI } from '../../services/api';
import { Play, Pause, SkipBack, SkipForward, BookmarkPlus, Settings, Target, FileText } from 'lucide-react';
import { BookmarkManager } from './BookmarkManager';
import { SettingsPanel } from '../Settings/SettingsPanel';
import { GoalsManager } from '../Goals/GoalsManager';
import { TextSidebar } from './TextSidebar';
import type { Book } from '../../types';

interface RSVPReaderProps {
  book: Book;
  onClose: () => void;
}

export const RSVPReader: React.FC<RSVPReaderProps> = ({ book, onClose }) => {
  const {
    currentWordIndex,
    isPlaying,
    wpm,
    preferences,
    sessionStartTime,
    wordsReadInSession,
    setCurrentWordIndex,
    setIsPlaying,
    setWpm,
    startSession,
    endSession,
    incrementWordsRead,
  } = useReaderStore();

  const [activeBook, setActiveBook] = useState<Book>(book);
  const [words, setWords] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showBookmark, setShowBookmark] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showTextSidebar, setShowTextSidebar] = useState(false);

  useEffect(() => {
    setActiveBook(book);
  }, [book]);

  useEffect(() => {
    if (activeBook.content) {
      const wordArray = activeBook.content.split(/\s+/).filter((w) => w.length > 0);
      setWords(wordArray);
      setCurrentWordIndex(activeBook.current_position || 0);
    }
  }, [activeBook, setCurrentWordIndex]);

  useEffect(() => {
    if (!sessionStartTime) {
      startSession();
    }
  }, [sessionStartTime, startSession]);

  const calculateDelay = useCallback((word: string): number => {
    const baseDelay = 60000 / wpm;
    
    if (preferences?.pause_on_punctuation) {
      if (/[.!?]$/.test(word)) {
        return baseDelay * 2;
      }
      if (/[,;:]$/.test(word)) {
        return baseDelay * 1.5;
      }
    }
    
    return baseDelay;
  }, [wpm, preferences]);

  const moveToNextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      incrementWordsRead();
    } else {
      setIsPlaying(false);
      handleEndSession(true);
    }
  }, [currentWordIndex, words.length, setCurrentWordIndex, incrementWordsRead, setIsPlaying]);

  const handleEndSession = useCallback(async (completed: boolean = false) => {
    const session = endSession();

    try {
      await statisticsAPI.createSession({
        book_id: activeBook.id,
        start_time: session.startTime.toISOString(),
        end_time: new Date().toISOString(),
        words_read: session.wordsRead,
        average_wpm: wpm,
      });

      await booksAPI.updateProgress(activeBook.id, currentWordIndex, completed);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [activeBook.id, currentWordIndex, wpm, endSession]);

  useEffect(() => {
    if (isPlaying && words.length > 0 && currentWordIndex < words.length) {
      const delay = calculateDelay(words[currentWordIndex]);
      intervalRef.current = setTimeout(moveToNextWord, delay);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentWordIndex, words, calculateDelay, moveToNextWord]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setWpm(wpm + 50);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setWpm(wpm - 50);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentWordIndex > 0) {
            setCurrentWordIndex(currentWordIndex - 1);
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          setWpm(wpm + 10);
          break;
        case '-':
          e.preventDefault();
          setWpm(wpm - 10);
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, wpm, currentWordIndex, words.length, setIsPlaying, setWpm, setCurrentWordIndex]);

  const handleClose = async () => {
    setIsPlaying(false);
    await handleEndSession(false);
    onClose();
  };

  const handleBookmarkNavigation = (wordIndex: number) => {
    setCurrentWordIndex(wordIndex);
    setShowBookmark(false);
  };

  const getHighlightedWord = (word: string): JSX.Element => {
    if (!word) return <></>;
    
    const position = preferences?.red_letter_position || 'first';
    let highlightIndex = 0;
    
    switch (position) {
      case 'first':
        highlightIndex = 0;
        break;
      case 'middle':
        highlightIndex = Math.floor(word.length / 2);
        break;
      case 'last':
        highlightIndex = word.length - 1;
        break;
      case 'random':
        highlightIndex = Math.floor(Math.random() * word.length);
        break;
    }
    
    return (
      <>
        {word.slice(0, highlightIndex)}
        <span style={{ color: preferences?.color_scheme.highlight || '#ff0000' }}>
          {word[highlightIndex]}
        </span>
        {word.slice(highlightIndex + 1)}
      </>
    );
  };

  const skipWords = (amount: number) => {
    const newIndex = Math.max(0, Math.min(words.length - 1, currentWordIndex + amount));
    setCurrentWordIndex(newIndex);
  };

  const handleReadTextFromSidebar = async (title: string, author: string, text: string) => {
    try {
      const response = await booksAPI.createFromText(title, author, text);
      const created = response.data.book;
      setIsPlaying(false);
      setCurrentWordIndex(0);
      setActiveBook({
        ...created,
        content: text,
        current_position: 0,
        created_at: created.created_at || new Date().toISOString(),
      });
      setShowTextSidebar(false);
    } catch (error) {
      console.error('Failed to create book from text:', error);
      throw error;
    }
  };

  const jumpToFirstMatch = useCallback((searchTerm: string) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return false;

    const idx = words.findIndex((w) => w.toLowerCase().includes(term));
    if (idx === -1) return false;

    setCurrentWordIndex(idx);
    return true;
  }, [words, setCurrentWordIndex]);

  const progress = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;
  const timeRemaining = words.length > 0
    ? Math.ceil((words.length - currentWordIndex) / (wpm / 60))
    : 0;

  const backgroundStyle = activeBook.background_theme?.type === 'gradient' && activeBook.background_theme.colors
    ? {
        background: `linear-gradient(135deg, ${activeBook.background_theme.colors.join(', ')})`,
      }
    : activeBook.background_theme?.type === 'image' && activeBook.background_theme.imageUrl
    ? {
        backgroundImage: `url(${activeBook.background_theme.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, #1a237e, #283593, #303f9f)',
      };

  const overlayIntensity = (preferences?.background_overlay_intensity || 50) / 100;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={backgroundStyle}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: preferences?.color_scheme.background || '#000000',
          opacity: overlayIntensity,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center p-4 bg-black bg-opacity-30">
          <div className="text-white">
            <h2 className="text-xl font-bold">{activeBook.title}</h2>
            <p className="text-sm opacity-80">{activeBook.author || 'Unknown Author'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTextSidebar(!showTextSidebar)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center gap-2"
              title="Clipboard / Paste Text"
            >
              <FileText size={18} />
              Text
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Exit (ESC)
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div
            className="text-center px-8 py-16 rounded-lg"
            style={{
              backgroundColor: `${preferences?.color_scheme.background || '#000000'}20`,
            }}
          >
            <div
              className="font-bold tracking-wide transition-all duration-100"
              style={{
                fontSize: `${preferences?.font_size || 48}px`,
                color: preferences?.color_scheme.text || '#ffffff',
                minHeight: `${(preferences?.font_size || 48) * 1.5}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '300px',
              }}
            >
              {words[currentWordIndex] && getHighlightedWord(words[currentWordIndex])}
            </div>
          </div>
        </div>

        <div className="p-6 bg-black bg-opacity-30">
          <div className="mb-4">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-white text-sm">
              <span>
                {currentWordIndex + 1} / {words.length} words
              </span>
              <span>~{timeRemaining}s remaining</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => skipWords(-10)}
              className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              title="Back 10 words"
            >
              <SkipBack size={24} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              title="Play/Pause (Space)"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>

            <button
              onClick={() => skipWords(10)}
              className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              title="Forward 10 words"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWpm(wpm - 50)}
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                -50
              </button>
              <span className="text-lg font-bold min-w-[100px] text-center">
                {wpm} WPM
              </span>
              <button
                onClick={() => setWpm(wpm + 50)}
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                +50
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBookmark(!showBookmark)}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                title="Bookmarks"
              >
                <BookmarkPlus size={20} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => setShowGoals(!showGoals)}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                title="Reading Goals"
              >
                <Target size={20} />
              </button>
            </div>

            <div className="text-sm opacity-80">
              Words read: {wordsReadInSession}
            </div>
          </div>
        </div>
      </div>

      <TextSidebar
        isOpen={showTextSidebar}
        onClose={() => setShowTextSidebar(false)}
        onReadText={handleReadTextFromSidebar}
        onJumpToFirstMatch={jumpToFirstMatch}
      />

      {/* Modal Overlays */}
      {showBookmark && (
        <BookmarkManager
          bookId={activeBook.id}
          currentWordIndex={currentWordIndex}
          onNavigate={handleBookmarkNavigation}
          onClose={() => setShowBookmark(false)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
        />
      )}

      {showGoals && (
        <GoalsManager
          onClose={() => setShowGoals(false)}
        />
      )}
    </div>
  );
};
