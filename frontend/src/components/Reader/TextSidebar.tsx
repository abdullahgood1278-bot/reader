import React, { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';

interface TextSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onReadText: (title: string, author: string, text: string) => Promise<void>;
  onJumpToFirstMatch?: (searchTerm: string) => boolean;
}

export const TextSidebar: React.FC<TextSidebarProps> = ({
  isOpen,
  onClose,
  onReadText,
  onJumpToFirstMatch,
}) => {
  const [title, setTitle] = useState('Clipboard Text');
  const [author, setAuthor] = useState('Unknown');
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const savedTitle = sessionStorage.getItem('clipboardTitle');
    const savedAuthor = sessionStorage.getItem('clipboardAuthor');
    const savedText = sessionStorage.getItem('clipboardText');

    if (savedTitle) setTitle(savedTitle);
    if (savedAuthor) setAuthor(savedAuthor);
    if (savedText) setText(savedText);
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem('clipboardTitle', title);
  }, [title]);

  useEffect(() => {
    sessionStorage.setItem('clipboardAuthor', author);
  }, [author]);

  useEffect(() => {
    sessionStorage.setItem('clipboardText', text);
  }, [text]);

  const wordCount = useMemo(() => {
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }, [text]);

  const handleRead = async () => {
    if (!text.trim()) {
      setError('Please paste or type some text first.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await onReadText(title || 'Clipboard Text', author || 'Unknown', text);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to start reading text');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 z-40 w-full max-w-md bg-black bg-opacity-80 backdrop-blur-md border-l border-white border-opacity-10 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white border-opacity-10">
        <div>
          <h3 className="text-white font-semibold">Clipboard / Notes</h3>
          <p className="text-xs text-gray-300">Paste text to read it with the RSVP reader</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-300 hover:text-white transition"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-200 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-900 bg-opacity-60 text-white border border-white border-opacity-10 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-200 mb-1">Author</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-900 bg-opacity-60 text-white border border-white border-opacity-10 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-gray-200">Text</label>
            <span className="text-xs text-gray-300">{wordCount.toLocaleString()} words</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={16}
            placeholder="Paste or type any text here..."
            className="w-full px-3 py-2 rounded bg-gray-900 bg-opacity-60 text-white border border-white border-opacity-10 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-200 mb-1">Search (in this text)</label>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-gray-900 bg-opacity-60 text-white border border-white border-opacity-10 focus:outline-none focus:border-blue-500"
              placeholder="Type to search..."
            />
            <button
              type="button"
              onClick={() => {
                const term = search.trim();
                if (!term) return;

                const idx = text.toLowerCase().indexOf(term.toLowerCase());
                if (idx === -1) {
                  setError('Search term not found in the clipboard text.');
                  return;
                }

                setError('');
                onJumpToFirstMatch?.(term);
              }}
              className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              title="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-500 bg-opacity-20 border border-red-500 text-red-100">
            {error}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white border-opacity-10">
        <button
          onClick={handleRead}
          disabled={isSaving || !text.trim()}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save & Read'}
        </button>
      </div>
    </div>
  );
};
