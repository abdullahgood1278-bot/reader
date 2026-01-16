import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkPlus, X, Edit2, Trash2 } from 'lucide-react';
import { bookmarksAPI } from '../../services/api';
import type { Bookmark } from '../../types';

interface BookmarkManagerProps {
  bookId: number;
  currentWordIndex: number;
  onNavigate: (wordIndex: number) => void;
  onClose: () => void;
}

interface BookmarkFormData {
  note: string;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({
  bookId,
  currentWordIndex,
  onNavigate,
  onClose
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BookmarkFormData>({ note: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, [bookId]);

  const loadBookmarks = async () => {
    try {
      const response = await bookmarksAPI.getAll();
      setBookmarks(response.data.bookmarks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const handleAddBookmark = async () => {
    if (!formData.note.trim()) return;
    
    setIsLoading(true);
    try {
      await bookmarksAPI.create({
        book_id: bookId,
        word_position: currentWordIndex,
        note: formData.note.trim()
      });
      setFormData({ note: '' });
      setIsAdding(false);
      loadBookmarks();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      alert('Failed to add bookmark. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBookmark = async (id: number) => {
    if (!formData.note.trim()) return;
    
    setIsLoading(true);
    try {
      await bookmarksAPI.update(id, { note: formData.note.trim() });
      setFormData({ note: '' });
      setEditingId(null);
      loadBookmarks();
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookmark = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      await bookmarksAPI.delete(id);
      loadBookmarks();
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      alert('Failed to delete bookmark. Please try again.');
    }
  };

  const startEdit = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setFormData({ note: bookmark.note || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ note: '' });
    setIsAdding(false);
  };

  const formatWordPosition = (position: number): string => {
    const words = ['first', 'second', 'third'];
    if (position === 0) return 'Start';
    if (position < 100) return `${position} words`;
    if (position < 1000) return `${Math.floor(position / 100) * 100}+ words`;
    return `${Math.floor(position / 1000)}K+ words`;
  };

  const getProgressPercentage = (position: number): number => {
    // This would need the total word count, but for now we'll estimate
    return Math.min((position / 10000) * 100, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Bookmark className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bookmarks</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Add Bookmark Form */}
          {isAdding && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Add Bookmark at Word {currentWordIndex + 1}
              </h3>
              <div className="space-y-3">
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ note: e.target.value })}
                  placeholder="Add a note for this bookmark (optional)"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddBookmark}
                    disabled={isLoading || !formData.note.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isLoading ? 'Adding...' : 'Add Bookmark'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Bookmark Button */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <BookmarkPlus size={20} />
              Add Bookmark at Current Position
            </button>
          )}

          {/* Bookmarks List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bookmarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bookmark size={48} className="mx-auto mb-3 opacity-50" />
                <p>No bookmarks yet</p>
                <p className="text-sm">Add bookmarks to save important passages</p>
              </div>
            ) : (
              bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  {editingId === bookmark.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ note: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBookmark(bookmark.id)}
                          disabled={isLoading || !formData.note.trim()}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Word {bookmark.word_position + 1}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({formatWordPosition(bookmark.word_position)})
                            </span>
                          </div>
                          {bookmark.note && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {bookmark.note}
                            </p>
                          )}
                          <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${getProgressPercentage(bookmark.word_position)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <button
                            onClick={() => startEdit(bookmark)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition"
                            title="Edit bookmark"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBookmark(bookmark.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Delete bookmark"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Added {new Date(bookmark.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => onNavigate(bookmark.word_position)}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
                        >
                          Go to this position
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};