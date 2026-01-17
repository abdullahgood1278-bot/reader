import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { JWTPayload } from '../types';
import { TextExtractor } from '../utils/textExtractor';
import { GenreDetector } from '../utils/genreDetector';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const DEFAULT_SAMPLE_CHAPTER_TEXT = `Zorian's eyes abruptly shot open, and he jerked upright, his heart hammering painfully in his chest.

For a moment he just sat there, trying to remember where he was. His room. His bed. Morning light filtering in through the window. The familiar creak of the old house.

He took a slow breath and forced himself to relax. It had been a dream — one of those unsettling, vivid ones that clung to the mind even after waking. He rubbed his eyes, then stared at his hands as if expecting them to be stained with something he couldn’t name.

Outside, the city was already awake. Carriages rattled over cobblestone streets, and the distant shouts of vendors drifted up from the market. Somewhere down the hall, his little sister was humming off-key.

Zorian swung his legs over the side of the bed. He could feel the weight of responsibility pressing down on him, the same way it always did when a new day began. School. Expectations. The constant sense that he was falling behind, that everyone else had some secret map of life he’d never been given.

He stood, crossed the room, and looked out the window. The sky was clear and bright. Ordinary. Safe. He let out a breath he hadn’t realized he was holding.

A knock came from the door. His mother’s voice followed, warm and firm at the same time. "Zorian, are you awake? Breakfast is almost ready."

He hesitated, then answered, "Yeah. I’m up."

He turned back toward the bed, and for the briefest instant he felt a dizzying lurch — as if the room had shifted under him — and then it was gone.

When he looked down again, he realized he was no longer standing.

...he was on his side`;

export class AuthController {
  static async createDefaultSampleBook(userId: number) {
    try {
      const cleanedText = TextExtractor.cleanText(DEFAULT_SAMPLE_CHAPTER_TEXT);
      const wordCount = TextExtractor.countWords(cleanedText);
      const title = "Mother of Learning - Sample Chapter";
      const author = "Domagoj Kurmaic";
      const genre = GenreDetector.detectGenre(cleanedText, title);
      const backgroundTheme = GenreDetector.generateBackgroundTheme(genre);

      const result = await query(
        `INSERT INTO books 
        (user_id, title, author, file_path, file_type, file_size, content, word_count, genre, background_theme) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING id`,
        [
          userId,
          title,
          author,
          null,
          'text',
          cleanedText.length,
          cleanedText,
          wordCount,
          genre,
          JSON.stringify(backgroundTheme),
        ]
      );

      const bookId = result.rows[0].id;

      await query(
        'INSERT INTO reading_progress (user_id, book_id, total_words) VALUES ($1, $2, $3)',
        [userId, bookId, wordCount]
      );

      console.log(`Default sample book created for user ${userId}`);
    } catch (error) {
      console.error('Failed to create default sample book:', error);
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await query(
        'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
        [email, username, hashedPassword]
      );

      const user = result.rows[0];

      await query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
        [user.id]
      );

      await query(
        'INSERT INTO user_statistics (user_id) VALUES ($1)',
        [user.id]
      );

      await AuthController.createDefaultSampleBook(user.id);

      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };

      // @ts-ignore - JWT sign expiresIn typing issue
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await query(
        'SELECT id, email, username, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };

      // @ts-ignore - JWT sign expiresIn typing issue
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      const result = await query(
        'SELECT id, email, username, created_at FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      console.error('Me error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}
