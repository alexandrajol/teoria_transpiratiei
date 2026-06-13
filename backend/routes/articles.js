import express from 'express';
import db from '../database/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// IMPORTANT: Specific routes must come BEFORE parameterized routes (/:id)

// Get all journalists (for editor dropdown)
router.get('/journalists', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username FROM users WHERE role = 'journalist' ORDER BY username"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching journalists:', error);
    res.status(500).json({ error: 'Failed to fetch journalists' });
  }
});

// Editor only: Get all articles (including pending) with journalist info
router.get('/editor/all', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        a.*,
        u1.username as main_journalist_username,
        u2.username as secondary_journalist_username
      FROM articles a
      LEFT JOIN users u1 ON a.main_journalist_id = u1.id
      LEFT JOIN users u2 ON a.secondary_journalist_id = u2.id
      ORDER BY a.date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Editor only: Create new empty article
router.post('/', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const result = await db.query(
      `INSERT INTO articles (created_by, status) VALUES (?, 'pending')`,
      [req.user.userId]
    );

    const newArticle = await db.query('SELECT * FROM articles WHERE id = ?', [result.lastID]);
    res.status(201).json(newArticle.rows[0]);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Editor only: Update article status (publish/unpublish)
router.patch('/:id/status', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "pending" or "published"' });
    }

    // If trying to publish, check for unresolved comments
    if (status === 'published') {
      const unresolvedComments = await db.query(
        `SELECT COUNT(*) as count FROM comments WHERE article_id = ? AND is_resolved = 0`,
        [id]
      );

      if (unresolvedComments.rows[0].count > 0) {
        return res.status(400).json({
          error: 'Cannot publish article with unresolved comments',
          unresolvedCount: unresolvedComments.rows[0].count
        });
      }
    }

    await db.query('UPDATE articles SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.query('SELECT * FROM articles WHERE id = ?', [id]);

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error updating article status:', error);
    res.status(500).json({ error: 'Failed to update article status' });
  }
});

// Editor only: Update article (only title and journalists)
router.put('/:id', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, main_journalist_id, secondary_journalist_id } = req.body;

    await db.query(
      `UPDATE articles
       SET title = ?, main_journalist_id = ?, secondary_journalist_id = ?
       WHERE id = ?`,
      [title, main_journalist_id || null, secondary_journalist_id || null, id]
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

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Editor only: Update article content (for paragraph reordering)
router.patch("/:id/content", authenticateToken, authorizeRoles("editor", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    await db.query(
      `UPDATE articles SET content = ? WHERE id = ?`,
      [content || "", id]
    );

    const updated = await db.query("SELECT * FROM articles WHERE id = ?", [id]);

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(updated.rows[0]);
  } catch (error) {
    console.error("Error updating article content:", error);
    res.status(500).json({ error: "Failed to update article content" });
  }
});

// Editor only: Delete article
router.delete('/:id', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Public: Get all published articles
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM articles WHERE status = 'published' ORDER BY date DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Public: Get single published article by ID (MUST be last!)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM articles WHERE id = ? AND status = 'published'",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

export default router;
