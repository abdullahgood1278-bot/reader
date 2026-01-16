import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { TextExtractor } from '../utils/textExtractor';
import { GenreDetector } from '../utils/genreDetector';
import * as fs from 'fs/promises';
import path from 'path';

export class BookController {
  static async uploadBook(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user!.userId;
      const file = req.file;
      const fileExtension = path.extname(file.originalname).slice(1).toLowerCase();

      const text = await TextExtractor.extractText(file.path, fileExtension);
      const cleanedText = TextExtractor.cleanText(text);
      const wordCount = TextExtractor.countWords(cleanedText);
      const metadata = TextExtractor.extractMetadata(cleanedText);

      const title = req.body.title || metadata.title || file.originalname.replace(/\.[^/.]+$/, '');
      const author = req.body.author || metadata.author || 'Unknown';

      const genre = GenreDetector.detectGenre(cleanedText, title);
      const backgroundTheme = GenreDetector.generateBackgroundTheme(genre);

      const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
      if (unsplashKey) {
        const imageUrl = await GenreDetector.getUnsplashImage(genre, unsplashKey);
        if (imageUrl) {
          backgroundTheme.imageUrl = imageUrl;
          backgroundTheme.type = 'image';
        }
      }

      const result = await query(
        `INSERT INTO books 
        (user_id, title, author, file_path, file_type, file_size, content, word_count, genre, background_theme) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING id, title, author, file_type, word_count, genre, background_theme, created_at`,
        [
          userId,
          title,
          author,
          file.path,
          fileExtension,
          file.size,
          cleanedText,
          wordCount,
          genre,
          JSON.stringify(backgroundTheme),
        ]
      );

      const book = result.rows[0];

      await query(
        'INSERT INTO reading_progress (user_id, book_id, total_words) VALUES ($1, $2, $3)',
        [userId, book.id, wordCount]
      );

      res.status(201).json({
        message: 'Book uploaded successfully',
        book: {
          ...book,
          background_theme: JSON.parse(book.background_theme),
        },
      });
    } catch (error) {
      console.error('Book upload error:', error);
      res.status(500).json({ error: 'Failed to upload book' });
    }
  }

  static async getBooks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await query(
        `SELECT 
          b.id, b.title, b.author, b.file_type, b.word_count, b.genre, b.background_theme, b.created_at,
          rp.current_position, rp.completed, rp.last_read_at
        FROM books b
        LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = b.user_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC`,
        [userId]
      );

      const books = result.rows.map(book => ({
        ...book,
        background_theme: JSON.parse(book.background_theme || '{}'),
      }));

      res.json({ books });
    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  }

  static async getBook(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const bookId = parseInt(req.params.id);

      const result = await query(
        `SELECT 
          b.*,
          rp.current_position, rp.completed, rp.last_read_at
        FROM books b
        LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = b.user_id
        WHERE b.id = $1 AND b.user_id = $2`,
        [bookId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      const book = result.rows[0];
      book.background_theme = JSON.parse(book.background_theme || '{}');

      res.json({ book });
    } catch (error) {
      console.error('Get book error:', error);
      res.status(500).json({ error: 'Failed to fetch book' });
    }
  }

  static async deleteBook(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const bookId = parseInt(req.params.id);

      const bookResult = await query(
        'SELECT file_path FROM books WHERE id = $1 AND user_id = $2',
        [bookId, userId]
      );

      if (bookResult.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      const filePath = bookResult.rows[0].file_path;

      await query('DELETE FROM books WHERE id = $1 AND user_id = $2', [bookId, userId]);

      if (filePath) {
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error('File deletion error:', error);
        }
      }

      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Delete book error:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  }

  static async updateProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const bookId = parseInt(req.params.id);
      const { currentPosition, completed } = req.body;

      await query(
        `UPDATE reading_progress 
        SET current_position = $1, completed = $2, last_read_at = CURRENT_TIMESTAMP
        WHERE user_id = $3 AND book_id = $4`,
        [currentPosition, completed || false, userId, bookId]
      );

      res.json({ message: 'Progress updated successfully' });
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  }
}
