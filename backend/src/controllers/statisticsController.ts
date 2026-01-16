import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export class StatisticsController {
  static async getStatistics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const statsResult = await query(
        'SELECT * FROM user_statistics WHERE user_id = $1',
        [userId]
      );

      const stats = statsResult.rows[0] || {};

      const recentSessions = await query(
        `SELECT 
          book_id,
          b.title as book_title,
          start_time,
          end_time,
          words_read,
          average_wpm,
          session_duration
        FROM reading_sessions rs
        JOIN books b ON rs.book_id = b.id
        WHERE rs.user_id = $1
        ORDER BY start_time DESC
        LIMIT 10`,
        [userId]
      );

      const goalsResult = await query(
        'SELECT * FROM reading_goals WHERE user_id = $1 AND end_date >= CURRENT_DATE ORDER BY created_at DESC',
        [userId]
      );

      res.json({
        statistics: stats,
        recentSessions: recentSessions.rows,
        goals: goalsResult.rows,
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  static async createSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { book_id, start_time, end_time, words_read, average_wpm } = req.body;

      const duration = end_time && start_time 
        ? Math.floor((new Date(end_time).getTime() - new Date(start_time).getTime()) / 1000)
        : 0;

      const result = await query(
        `INSERT INTO reading_sessions 
        (user_id, book_id, start_time, end_time, words_read, average_wpm, session_duration)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [userId, book_id, start_time, end_time, words_read, average_wpm, duration]
      );

      await this.updateUserStatistics(userId, words_read, duration, average_wpm);

      res.status(201).json({
        message: 'Session created successfully',
        session: result.rows[0],
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }

  static async getGoals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await query(
        'SELECT * FROM reading_goals WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      res.json({ goals: result.rows });
    } catch (error) {
      console.error('Get goals error:', error);
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  }

  static async deleteGoal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(req.params.id);

      const result = await query(
        'DELETE FROM reading_goals WHERE id = $1 AND user_id = $2 RETURNING *',
        [goalId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Delete goal error:', error);
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  }

  static async updateGoal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(req.params.id);
      const { goal_type, target_value, period, start_date, end_date } = req.body;

      const result = await query(
        `UPDATE reading_goals 
        SET goal_type = $1, target_value = $2, period = $3, start_date = $4, end_date = $5
        WHERE id = $6 AND user_id = $7
        RETURNING *`,
        [goal_type, target_value, period, start_date, end_date, goalId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({
        message: 'Goal updated successfully',
        goal: result.rows[0],
      });
    } catch (error) {
      console.error('Update goal error:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  }

  static async updateUserStatistics(
    userId: number,
    wordsRead: number,
    duration: number,
    avgWpm: number
  ) {
    const today = new Date().toISOString().split('T')[0];

    const statsResult = await query(
      'SELECT * FROM user_statistics WHERE user_id = $1',
      [userId]
    );

    if (statsResult.rows.length === 0) {
      await query(
        `INSERT INTO user_statistics (user_id, total_words_read, total_reading_time, average_wpm, last_read_date, current_streak, longest_streak)
        VALUES ($1, $2, $3, $4, $5, 1, 1)`,
        [userId, wordsRead, duration, avgWpm, today]
      );
      return;
    }

    const stats = statsResult.rows[0];
    const lastReadDate = stats.last_read_date ? new Date(stats.last_read_date) : null;
    const todayDate = new Date(today);

    let newStreak = stats.current_streak || 0;
    
    if (lastReadDate) {
      const daysDiff = Math.floor((todayDate.getTime() - lastReadDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        newStreak = stats.current_streak;
      } else if (daysDiff === 1) {
        newStreak = stats.current_streak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, stats.longest_streak || 0);
    const totalWords = (stats.total_words_read || 0) + wordsRead;
    const totalTime = (stats.total_reading_time || 0) + duration;
    const newAvgWpm = Math.round(((stats.average_wpm || 0) + avgWpm) / 2);

    await query(
      `UPDATE user_statistics 
      SET total_words_read = $1,
          total_reading_time = $2,
          average_wpm = $3,
          current_streak = $4,
          longest_streak = $5,
          last_read_date = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $7`,
      [totalWords, totalTime, newAvgWpm, newStreak, longestStreak, today, userId]
    );
  }

  static async createGoal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { goal_type, target_value, period, start_date, end_date } = req.body;

      const result = await query(
        `INSERT INTO reading_goals 
        (user_id, goal_type, target_value, period, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [userId, goal_type, target_value, period, start_date, end_date]
      );

      res.status(201).json({
        message: 'Goal created successfully',
        goal: result.rows[0],
      });
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  }

  static async updateGoalProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const goalId = parseInt(req.params.id);
      const { current_value, completed } = req.body;

      const result = await query(
        `UPDATE reading_goals 
        SET current_value = $1, completed = $2
        WHERE id = $3 AND user_id = $4
        RETURNING *`,
        [current_value, completed, goalId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({
        message: 'Goal updated successfully',
        goal: result.rows[0],
      });
    } catch (error) {
      console.error('Update goal error:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  }
}
