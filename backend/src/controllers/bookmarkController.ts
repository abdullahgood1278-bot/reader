import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export class BookmarkController {
  static async createBookmark(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { book_id, word_position, note } = req.body;

      const result = await query(
        `INSERT INTO bookmarks (user_id, book_id, word_position, note)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [userId, book_id, word_position, note]
      );

      res.status(201).json({
        message: 'Bookmark created successfully',
        bookmark: result.rows[0],
      });
    } catch (error) {
      console.error('Create bookmark error:', error);
      res.status(500).json({ error: 'Failed to create bookmark' });
    }
  }

  static async getBookmarks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const bookId = req.query.book_id ? parseInt(req.query.book_id as string) : null;

      let queryText = `
        SELECT b.*, books.title as book_title
        FROM bookmarks b
        JOIN books ON b.book_id = books.id
        WHERE b.user_id = $1
      `;
      const params: unknown[] = [userId];

      if (bookId) {
        queryText += ' AND b.book_id = $2';
        params.push(bookId);
      }

      queryText += ' ORDER BY b.created_at DESC';

      const result = await query(queryText, params);

      res.json({ bookmarks: result.rows });
    } catch (error) {
      console.error('Get bookmarks error:', error);
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  }

  static async deleteBookmark(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const bookmarkId = parseInt(req.params.id);

      const result = await query(
        'DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING id',
        [bookmarkId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }

      res.json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
      console.error('Delete bookmark error:', error);
      res.status(500).json({ error: 'Failed to delete bookmark' });
    }
  }
}
