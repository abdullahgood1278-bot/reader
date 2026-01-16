import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export class PreferencesController {
  static async getPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Preferences not found' });
      }

      const preferences = result.rows[0];
      preferences.color_scheme = JSON.parse(preferences.color_scheme || '{}');

      res.json({ preferences });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  }

  static async updatePreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const {
        default_wpm,
        red_letter_position,
        font_size,
        theme,
        color_scheme,
        pause_on_punctuation,
        background_overlay_intensity,
      } = req.body;

      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (default_wpm !== undefined) {
        updates.push(`default_wpm = $${paramIndex++}`);
        values.push(default_wpm);
      }
      if (red_letter_position !== undefined) {
        updates.push(`red_letter_position = $${paramIndex++}`);
        values.push(red_letter_position);
      }
      if (font_size !== undefined) {
        updates.push(`font_size = $${paramIndex++}`);
        values.push(font_size);
      }
      if (theme !== undefined) {
        updates.push(`theme = $${paramIndex++}`);
        values.push(theme);
      }
      if (color_scheme !== undefined) {
        updates.push(`color_scheme = $${paramIndex++}`);
        values.push(JSON.stringify(color_scheme));
      }
      if (pause_on_punctuation !== undefined) {
        updates.push(`pause_on_punctuation = $${paramIndex++}`);
        values.push(pause_on_punctuation);
      }
      if (background_overlay_intensity !== undefined) {
        updates.push(`background_overlay_intensity = $${paramIndex++}`);
        values.push(background_overlay_intensity);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      const result = await query(
        `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Preferences not found' });
      }

      const preferences = result.rows[0];
      preferences.color_scheme = JSON.parse(preferences.color_scheme || '{}');

      res.json({ message: 'Preferences updated successfully', preferences });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }
}
