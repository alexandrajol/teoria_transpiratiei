import express from 'express';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get reaction counts for an article
router.get('/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    const result = await db.query(
      `SELECT
        reaction,
        COUNT(*) as count
       FROM article_reactions
       WHERE article_id = ?
       GROUP BY reaction`,
      [articleId]
    );

    const counts = {
      likes: 0,
      dislikes: 0
    };

    result.rows.forEach(row => {
      if (row.reaction === 'like') {
        counts.likes = row.count;
      } else if (row.reaction === 'dislike') {
        counts.dislikes = row.count;
      }
    });

    res.json(counts);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ error: 'Failed to fetch reactions' });
  }
});

// Get user's reaction for an article (requires authentication)
router.get('/:articleId/user', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT reaction FROM article_reactions WHERE article_id = ? AND user_id = ?`,
      [articleId, userId]
    );

    res.json({
      reaction: result.rows.length > 0 ? result.rows[0].reaction : null
    });
  } catch (error) {
    console.error('Error fetching user reaction:', error);
    res.status(500).json({ error: 'Failed to fetch user reaction' });
  }
});

// Add or update a reaction (requires authentication)
router.post('/:articleId', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { reaction } = req.body;
    const userId = req.user.id;

    if (!reaction || !['like', 'dislike'].includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction. Must be "like" or "dislike"' });
    }

    // Check if article exists and is published
    const article = await db.query(
      `SELECT id FROM articles WHERE id = ? AND status = 'published'`,
      [articleId]
    );

    if (article.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or not published' });
    }

    // Check if user already reacted
    const existingReaction = await db.query(
      `SELECT reaction FROM article_reactions WHERE article_id = ? AND user_id = ?`,
      [articleId, userId]
    );

    if (existingReaction.rows.length > 0) {
      // Update existing reaction
      await db.query(
        `UPDATE article_reactions SET reaction = ? WHERE article_id = ? AND user_id = ?`,
        [reaction, articleId, userId]
      );
    } else {
      // Insert new reaction
      await db.query(
        `INSERT INTO article_reactions (article_id, user_id, reaction) VALUES (?, ?, ?)`,
        [articleId, userId, reaction]
      );
    }

    // Get updated counts
    const counts = await db.query(
      `SELECT
        reaction,
        COUNT(*) as count
       FROM article_reactions
       WHERE article_id = ?
       GROUP BY reaction`,
      [articleId]
    );

    const reactionCounts = {
      likes: 0,
      dislikes: 0
    };

    counts.rows.forEach(row => {
      if (row.reaction === 'like') {
        reactionCounts.likes = row.count;
      } else if (row.reaction === 'dislike') {
        reactionCounts.dislikes = row.count;
      }
    });

    res.json({
      message: 'Reaction saved successfully',
      userReaction: reaction,
      counts: reactionCounts
    });
  } catch (error) {
    console.error('Error saving reaction:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to save reaction', details: error.message });
  }
});

// Remove a reaction (requires authentication)
router.delete('/:articleId', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    await db.query(
      `DELETE FROM article_reactions WHERE article_id = ? AND user_id = ?`,
      [articleId, userId]
    );

    // Get updated counts
    const counts = await db.query(
      `SELECT
        reaction,
        COUNT(*) as count
       FROM article_reactions
       WHERE article_id = ?
       GROUP BY reaction`,
      [articleId]
    );

    const reactionCounts = {
      likes: 0,
      dislikes: 0
    };

    counts.rows.forEach(row => {
      if (row.reaction === 'like') {
        reactionCounts.likes = row.count;
      } else if (row.reaction === 'dislike') {
        reactionCounts.dislikes = row.count;
      }
    });

    res.json({
      message: 'Reaction removed successfully',
      counts: reactionCounts
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

export default router;
