import React, { useState, useEffect } from 'react';
import { booksAPI, preferencesAPI, statisticsAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useReaderStore } from '../stores/readerStore';
import { RSVPReader } from '../components/Reader/RSVPReader';
import { Upload, BookOpen, Settings, TrendingUp, LogOut, Book } from 'lucide-react';
import type { Book, UserStatistics } from '../types';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { setCurrentBook, setPreferences } = useReaderStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'stats' | 'settings'>('books');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksRes, prefsRes, statsRes] = await Promise.all([
        booksAPI.getAll(),
        preferencesAPI.get(),
        statisticsAPI.get(),
      ]);

      setBooks(booksRes.data.books);
      setPreferences(prefsRes.data.preferences);
      setStatistics(statsRes.data.statistics);
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
      setUploadError(error.response?.data?.error || 'Upload failed');
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

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (selectedBook) {
    return <RSVPReader book={selectedBook} onClose={() => setSelectedBook(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <nav className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="text-white" size={32} />
              <h1 className="text-2xl font-bold text-white">Speed Reader</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white">Welcome, {user?.username}!</span>
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
                : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
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
                : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
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
                : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
            }`}
          >
            <Settings size={20} />
            Settings
          </button>
        </div>

        {activeTab === 'books' && (
          <div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Upload New Book</h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                  <Upload size={20} />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept=".pdf,.epub,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <span className="text-white text-sm">
                  Supported: PDF, EPUB, TXT, DOC, DOCX (max 50MB)
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
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-gray-300 text-sm mb-2">Total Words Read</h3>
              <p className="text-3xl font-bold text-white">
                {statistics.total_words_read?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-gray-300 text-sm mb-2">Books Completed</h3>
              <p className="text-3xl font-bold text-white">{statistics.total_books_completed || 0}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-gray-300 text-sm mb-2">Reading Time</h3>
              <p className="text-3xl font-bold text-white">
                {formatTime(statistics.total_reading_time || 0)}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-gray-300 text-sm mb-2">Average Speed</h3>
              <p className="text-3xl font-bold text-white">{statistics.average_wpm || 0} WPM</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-gray-300 text-sm mb-2">Current Streak</h3>
              <p className="text-3xl font-bold text-white">{statistics.current_streak || 0} days</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-gray-300 text-sm mb-2">Longest Streak</h3>
              <p className="text-3xl font-bold text-white">{statistics.longest_streak || 0} days</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Reading Preferences</h2>
            <div className="text-white space-y-4">
              <p>Settings panel coming soon!</p>
              <p className="text-gray-300">
                Configure your default reading speed, themes, and more in the reader.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
