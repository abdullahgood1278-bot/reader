import React, { useState, useEffect } from 'react';
import { booksAPI, preferencesAPI, statisticsAPI, configAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useReaderStore } from '../stores/readerStore';
import { RSVPReader } from '../components/Reader/RSVPReader';
import { SettingsPanel } from '../components/Settings/SettingsPanel';
import { BookmarkManager } from '../components/Reader/BookmarkManager';
import { GoalsManager } from '../components/Goals/GoalsManager';
import { TextInputModal } from '../components/TextInput/TextInputModal';
import { Upload, BookOpen, Settings, TrendingUp, LogOut, Book, Target, Bookmark, Moon, Sun, FileText } from 'lucide-react';
import type { Book, UserStatistics } from '../types';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { setCurrentBook, setPreferences } = useReaderStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [maxFileSizeLabel, setMaxFileSizeLabel] = useState<string>('');
  const [showTextModal, setShowTextModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'books' | 'stats' | 'settings'>('books');
  const [showSettings, setShowSettings] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksRes, prefsRes, statsRes, configRes] = await Promise.all([
        booksAPI.getAll(),
        preferencesAPI.get(),
        statisticsAPI.get(),
        configAPI.get().catch(() => ({ data: { maxFileSizeLabel: '200MB' } })),
      ]);

      setBooks(booksRes.data.books);
      setPreferences(prefsRes.data.preferences);
      setStatistics(statsRes.data.statistics);
      setMaxFileSizeLabel(configRes.data.maxFileSizeLabel);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await booksAPI.upload(formData);
      await loadData();
      e.target.value = '';
    } catch (error: any) {
      if (error?.response?.status === 413) {
        setUploadError(error.response?.data?.error || `File is too large. Maximum upload size is ${maxFileSizeLabel || '200MB'}.`);
      } else {
        setUploadError(error.response?.data?.error || 'Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReadBook = async (book: Book) => {
    try {
      const response = await booksAPI.getOne(book.id);
      const fullBook = response.data.book;
      setCurrentBook(fullBook);
      setSelectedBook(fullBook);
    } catch (error) {
      console.error('Failed to load book:', error);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await booksAPI.delete(bookId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const handleTextSubmit = async (title: string, author: string, text: string) => {
    try {
      await booksAPI.createFromText(title, author, text);
      await loadData();
    } catch (error) {
      console.error('Failed to create book from text:', error);
      throw error;
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Apply dark mode class to document
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  if (selectedBook) {
    return (
      <>
        <RSVPReader book={selectedBook} onClose={() => setSelectedBook(null)} />
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
        {showGoals && (
          <GoalsManager onClose={() => setShowGoals(false)} />
        )}
      </>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50'
      }`}>
        <nav className={`backdrop-blur-sm border-b transition-colors ${
          darkMode 
            ? 'bg-black bg-opacity-30 border-white border-opacity-10' 
            : 'bg-white bg-opacity-80 border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <BookOpen className={darkMode ? 'text-white' : 'text-gray-800'} size={32} />
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Speed Reader
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition ${
                    darkMode 
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => setShowGoals(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    darkMode 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  <Target size={18} />
                  Goals
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    darkMode 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-indigo-500 text-white hover:bg-indigo-600'
                  }`}
                >
                  <Settings size={18} />
                  Settings
                </button>
                <span className={darkMode ? 'text-white' : 'text-gray-700'}>
                  Welcome, {user?.username}!
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'books'
                ? 'bg-blue-600 text-white'
                : darkMode 
                  ? 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                  : 'bg-white bg-opacity-60 text-gray-700 hover:bg-opacity-80'
            }`}
          >
            <Book size={20} />
            My Books
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white'
                : darkMode 
                  ? 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                  : 'bg-white bg-opacity-60 text-gray-700 hover:bg-opacity-80'
            }`}
          >
            <TrendingUp size={20} />
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : darkMode 
                  ? 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                  : 'bg-white bg-opacity-60 text-gray-700 hover:bg-opacity-80'
            }`}
          >
            <Settings size={20} />
            Settings
          </button>
        </div>

        {activeTab === 'books' && (
          <div>
            <div className={`backdrop-blur-sm rounded-lg p-6 mb-8 transition-colors ${
              darkMode 
                ? 'bg-white bg-opacity-10' 
                : 'bg-white bg-opacity-80 border border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Add New Content
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <label className={`flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition ${
                  darkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}>
                  <Upload size={20} />
                  {isUploading ? 'Uploading...' : 'Upload File'}
                  <input
                    type="file"
                    accept=".pdf,.epub,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowTextModal(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                    darkMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  <FileText size={20} />
                  Paste Text
                </button>
                <span className={darkMode ? 'text-white text-sm' : 'text-gray-600 text-sm'}>
                  Supported: PDF, EPUB, TXT, DOC, DOCX (max {maxFileSizeLabel || '200MB'})
                </span>
              </div>
              {uploadError && (
                <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-white rounded">
                  {uploadError}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 hover:bg-opacity-20 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{book.title}</h3>
                      <p className="text-gray-300 text-sm mb-1">{book.author || 'Unknown Author'}</p>
                      <p className="text-gray-400 text-xs">
                        {book.word_count?.toLocaleString()} words • {book.genre}
                      </p>
                    </div>
                  </div>

                  {book.current_position && book.current_position > 0 && (
                    <div className="mb-4">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(book.current_position / (book.word_count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.round((book.current_position / (book.word_count || 1)) * 100)}% complete
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReadBook(book)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      {book.current_position && book.current_position > 0 ? 'Continue' : 'Start Reading'}
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {books.length === 0 && (
              <div className="text-center py-16 text-white">
                <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">No books yet</h3>
                <p className="text-gray-300">Upload your first book to start speed reading!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`backdrop-blur-sm rounded-lg p-6 transition-colors ${
              darkMode ? 'bg-white bg-opacity-10' : 'bg-white bg-opacity-80 border border-gray-200'
            }`}>
              <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Words Read
              </h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {statistics.total_words_read?.toLocaleString() || 0}
              </p>
            </div>
            <div className={`backdrop-blur-sm rounded-lg p-6 transition-colors ${
              darkMode ? 'bg-white bg-opacity-10' : 'bg-white bg-opacity-80 border border-gray-200'
            }`}>
              <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Books Completed
              </h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {statistics.total_books_completed || 0}
              </p>
            </div>
            <div className={`backdrop-blur-sm rounded-lg p-6 transition-colors ${
              darkMode ? 'bg-white bg-opacity-10' : 'bg-white bg-opacity-80 border border-gray-200'
            }`}>
              <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Reading Time
              </h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {formatTime(statistics.total_reading_time || 0)}
              </p>
            </div>
            <div className={`backdrop-blur-sm rounded-lg p-6 transition-colors ${
              darkMode ? 'bg-white bg-opacity-10' : 'bg-white bg-opacity-80 border border-gray-200'
            }`}>
              <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Average Speed
              </h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {statistics.average_wpm || 0} WPM
              </p>
            </div>
            <div className={`backdrop-blur-sm rounded-lg p-6 transition-colors ${
              darkMode ? 'bg-white bg-opacity-10' : 'bg-white bg-opacity-80 border border-gray-200'
            }`}>
              <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Current Streak
              </h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {statistics.current_streak || 0} days
              </p>
            </div>
            <div className={`backdrop-blur-sm rounded-lg p-6 transition-colors ${
              darkMode ? 'bg-white bg-opacity-10' : 'bg-white bg-opacity-80 border border-gray-200'
            }`}>
              <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Longest Streak
              </h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {statistics.longest_streak || 0} days
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`backdrop-blur-sm rounded-lg p-6 transition-colors ${
            darkMode ? 'bg-white bg-opacity-10' : 'bg-white bg-opacity-80 border border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Reading Preferences
            </h2>
            <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Settings size={20} />
                    Open Full Settings Panel
                  </button>
                  <button
                    onClick={() => setShowGoals(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Target size={20} />
                    Manage Reading Goals
                  </button>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Dark Mode</span>
                      <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-lg transition ${
                          darkMode 
                            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Configure your default reading speed, themes, and more in the full settings panel.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modal Overlays */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {showGoals && (
        <GoalsManager onClose={() => setShowGoals(false)} />
      )}

      {showTextModal && (
        <TextInputModal
          onClose={() => setShowTextModal(false)}
          onSubmit={handleTextSubmit}
        />
      )}
    </div>
  );
};
