import express from 'express';
import db from '../database/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all articles assigned to the logged-in journalist
router.get('/my-articles', authenticateToken, authorizeRoles('journalist'), async (req, res) => {
  try {
    const userId = req.user.id; // JWT token stores id, not userId
    console.log('Fetching articles for journalist ID:', userId);

    const result = await db.query(`
      SELECT
        a.*,
        u1.username as main_journalist_username,
        u2.username as secondary_journalist_username,
        creator.username as created_by_username
      FROM articles a
      LEFT JOIN users u1 ON a.main_journalist_id = u1.id
      LEFT JOIN users u2 ON a.secondary_journalist_id = u2.id
      LEFT JOIN users creator ON a.created_by = creator.id
      WHERE a.main_journalist_id = ? OR a.secondary_journalist_id = ?
      ORDER BY a.date DESC
    `, [userId, userId]);

    console.log('Found articles:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching journalist articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article (only if journalist is assigned)
router.get('/my-articles/:id', authenticateToken, authorizeRoles('journalist'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // JWT token stores id, not userId

    const result = await db.query(`
      SELECT
        a.*,
        u1.username as main_journalist_username,
        u2.username as secondary_journalist_username
      FROM articles a
      LEFT JOIN users u1 ON a.main_journalist_id = u1.id
      LEFT JOIN users u2 ON a.secondary_journalist_id = u2.id
      WHERE a.id = ? AND (a.main_journalist_id = ? OR a.secondary_journalist_id = ?)
    `, [id, userId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or not assigned to you' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Update article content (only content, author, category, image - NOT title or status)
router.put('/my-articles/:id', authenticateToken, authorizeRoles('journalist'), async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author, category, image } = req.body;
    const userId = req.user.id; // JWT token stores id, not userId

    // Verify journalist is assigned to this article
    const checkResult = await db.query(
      `SELECT id FROM articles WHERE id = ? AND (main_journalist_id = ? OR secondary_journalist_id = ?)`,
      [id, userId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'You are not assigned to this article' });
    }

    // Update only the fields journalists can edit
    await db.query(
      `UPDATE articles
       SET content = ?, author = ?, category = ?, image = ?
       WHERE id = ?`,
      [content || '', author || '', category || '', image || '', id]
    );

    const updated = await db.query(`
      SELECT
        a.*,
        u1.username as main_journalist_username,
        u2.username as secondary_journalist_username
      FROM articles a
      LEFT JOIN users u1 ON a.main_journalist_id = u1.id
      LEFT JOIN users u2 ON a.secondary_journalist_id = u2.id
      WHERE a.id = ?
    `, [id]);

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

export default router;
