import express from 'express';
import db from '../database/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all comments for an article (editor and journalist can access)
router.get('/article/:articleId', authenticateToken, authorizeRoles('editor', 'admin', 'journalist'), async (req, res) => {
  try {
    const { articleId } = req.params;

    const result = await db.query(`
      SELECT
        c.*,
        u.username as commenter_name,
        u.role as commenter_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ?
      ORDER BY c.created_at ASC
    `, [articleId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment (editor only)
router.post('/article/:articleId', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const { articleId } = req.params;
    const { comment_text } = req.body;
    const userId = req.user.id;

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const result = await db.query(
      `INSERT INTO comments (article_id, user_id, comment_text)
       VALUES (?, ?, ?)`,
      [articleId, userId, comment_text.trim()]
    );

    const newComment = await db.query(`
      SELECT
        c.*,
        u.username as commenter_name,
        u.role as commenter_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.lastID]);

    res.status(201).json(newComment.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Resolve/unresolve comment (editor only)
router.patch('/:commentId/resolve', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const { commentId } = req.params;
    const { is_resolved } = req.body;

    const resolvedAt = is_resolved ? new Date().toISOString() : null;

    await db.query(
      `UPDATE comments SET is_resolved = ?, resolved_at = ? WHERE id = ?`,
      [is_resolved ? 1 : 0, resolvedAt, commentId]
    );

    const updated = await db.query(`
      SELECT
        c.*,
        u.username as commenter_name,
        u.role as commenter_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [commentId]);

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment (editor only)
router.delete('/:commentId', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const { commentId } = req.params;

    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Check if article has unresolved comments (used before publishing)
router.get('/article/:articleId/unresolved-count', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const { articleId } = req.params;

    const result = await db.query(
      `SELECT COUNT(*) as count FROM comments WHERE article_id = ? AND is_resolved = 0`,
      [articleId]
    );

    res.json({ unresolvedCount: result.rows[0].count });
  } catch (error) {
    console.error('Error checking unresolved comments:', error);
    res.status(500).json({ error: 'Failed to check unresolved comments' });
  }
});

export default router;
