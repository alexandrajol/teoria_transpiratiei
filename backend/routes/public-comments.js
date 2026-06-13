import express from 'express';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeSentiment, SENTIMENT_COLORS } from '../services/sentiment-service.js';

const router = express.Router();

// Get all comments for a published article (requires authentication)
router.get('/article/:articleId', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;

    // Check if article exists and is published
    const article = await db.query(
      `SELECT id, status FROM articles WHERE id = ? AND status = 'published'`,
      [articleId]
    );

    if (article.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or not published' });
    }

    // Get all comments with user info and sentiment
    const comments = await db.query(
      `SELECT
        pc.id,
        pc.comment_text,
        pc.created_at,
        pc.sentiment,
        u.username,
        u.role
       FROM public_comments pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.article_id = ?
       ORDER BY pc.created_at DESC`,
      [articleId]
    );

    // Add sentiment color to each comment
    const commentsWithColor = comments.rows.map(comment => ({
      ...comment,
      sentimentColor: SENTIMENT_COLORS[comment.sentiment] || SENTIMENT_COLORS.neutral
    }));

    res.json(commentsWithColor);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to a published article (requires authentication)
router.post('/article/:articleId', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { comment_text } = req.body;
    const userId = req.user.id;

    if (!comment_text || comment_text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    if (comment_text.length > 1000) {
      return res.status(400).json({ error: 'Comment is too long (max 1000 characters)' });
    }

    // Check if article exists and is published
    const article = await db.query(
      `SELECT id, status FROM articles WHERE id = ? AND status = 'published'`,
      [articleId]
    );

    if (article.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or not published' });
    }

    // Analyze sentiment using AI
    console.log('🤖 Analyzing sentiment for new comment...');
    const sentiment = await analyzeSentiment(comment_text.trim());
    console.log(`✅ Sentiment detected: ${sentiment}`);

    // Insert the comment with sentiment
    const result = await db.query(
      `INSERT INTO public_comments (article_id, user_id, comment_text, sentiment)
       VALUES (?, ?, ?, ?)`,
      [articleId, userId, comment_text.trim(), sentiment]
    );

    // Get the newly created comment with user info
    const newComment = await db.query(
      `SELECT
        pc.id,
        pc.comment_text,
        pc.created_at,
        pc.sentiment,
        u.username,
        u.role
       FROM public_comments pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.id = ?`,
      [result.lastID]
    );

    const commentWithColor = {
      ...newComment.rows[0],
      sentimentColor: SENTIMENT_COLORS[sentiment]
    };

    res.status(201).json(commentWithColor);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete a comment (only comment owner or admin)
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get the comment
    const comment = await db.query(
      `SELECT user_id FROM public_comments WHERE id = ?`,
      [commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.rows[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete the comment
    await db.query(
      `DELETE FROM public_comments WHERE id = ?`,
      [commentId]
    );

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Update a comment (only comment owner)
router.put('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment_text } = req.body;
    const userId = req.user.id;

    if (!comment_text || comment_text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    if (comment_text.length > 1000) {
      return res.status(400).json({ error: 'Comment is too long (max 1000 characters)' });
    }

    // Get the comment
    const comment = await db.query(
      `SELECT user_id FROM public_comments WHERE id = ?`,
      [commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    // Re-analyze sentiment for updated comment
    console.log('🤖 Re-analyzing sentiment for edited comment...');
    const sentiment = await analyzeSentiment(comment_text.trim());
    console.log(`✅ New sentiment: ${sentiment}`);

    // Update the comment with new sentiment
    await db.query(
      `UPDATE public_comments SET comment_text = ?, sentiment = ? WHERE id = ?`,
      [comment_text.trim(), sentiment, commentId]
    );

    // Get the updated comment with user info
    const updatedComment = await db.query(
      `SELECT
        pc.id,
        pc.comment_text,
        pc.created_at,
        pc.sentiment,
        u.username,
        u.role
       FROM public_comments pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.id = ?`,
      [commentId]
    );

    const commentWithColor = {
      ...updatedComment.rows[0],
      sentimentColor: SENTIMENT_COLORS[sentiment]
    };

    res.json(commentWithColor);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Get comment count for an article (public - for stats)
router.get('/count/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    const result = await db.query(
      `SELECT COUNT(*) as count FROM public_comments WHERE article_id = ?`,
      [articleId]
    );

    res.json({ count: result.rows[0].count });
  } catch (error) {
    console.error('Error fetching comment count:', error);
    res.status(500).json({ error: 'Failed to fetch comment count' });
  }
});

export default router;
