import express from 'express';
import db from '../database/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get overall statistics (admin only)
router.get('/overview', authenticateToken, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    // Get total articles
    const totalArticles = await db.query(
      `SELECT COUNT(*) as count FROM articles WHERE status = 'published'`
    );

    // Get total reactions
    const totalReactions = await db.query(
      `SELECT COUNT(*) as count FROM article_reactions`
    );

    // Get total likes and dislikes
    const reactionBreakdown = await db.query(
      `SELECT
        reaction,
        COUNT(*) as count
       FROM article_reactions
       GROUP BY reaction`
    );

    const breakdown = {
      likes: 0,
      dislikes: 0
    };

    reactionBreakdown.rows.forEach(row => {
      if (row.reaction === 'like') {
        breakdown.likes = row.count;
      } else if (row.reaction === 'dislike') {
        breakdown.dislikes = row.count;
      }
    });

    // Get most liked articles
    const mostLiked = await db.query(
      `SELECT
        a.id,
        a.title,
        a.author,
        a.category,
        a.date,
        COUNT(CASE WHEN ar.reaction = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN ar.reaction = 'dislike' THEN 1 END) as dislikes,
        COUNT(*) as total_reactions
       FROM articles a
       LEFT JOIN article_reactions ar ON a.id = ar.article_id
       WHERE a.status = 'published'
       GROUP BY a.id
       HAVING likes > 0
       ORDER BY likes DESC, total_reactions DESC
       LIMIT 10`
    );

    // Get most disliked articles
    const mostDisliked = await db.query(
      `SELECT
        a.id,
        a.title,
        a.author,
        a.category,
        a.date,
        COUNT(CASE WHEN ar.reaction = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN ar.reaction = 'dislike' THEN 1 END) as dislikes,
        COUNT(*) as total_reactions
       FROM articles a
       LEFT JOIN article_reactions ar ON a.id = ar.article_id
       WHERE a.status = 'published'
       GROUP BY a.id
       HAVING dislikes > 0
       ORDER BY dislikes DESC, total_reactions DESC
       LIMIT 10`
    );

    // Get articles with most engagement
    const mostEngaging = await db.query(
      `SELECT
        a.id,
        a.title,
        a.author,
        a.category,
        a.date,
        COUNT(CASE WHEN ar.reaction = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN ar.reaction = 'dislike' THEN 1 END) as dislikes,
        COUNT(*) as total_reactions
       FROM articles a
       LEFT JOIN article_reactions ar ON a.id = ar.article_id
       WHERE a.status = 'published'
       GROUP BY a.id
       HAVING total_reactions > 0
       ORDER BY total_reactions DESC
       LIMIT 10`
    );

    // Get reaction trends by category
    const categoryStats = await db.query(
      `SELECT
        a.category,
        COUNT(DISTINCT a.id) as article_count,
        COUNT(CASE WHEN ar.reaction = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN ar.reaction = 'dislike' THEN 1 END) as dislikes,
        COUNT(ar.id) as total_reactions
       FROM articles a
       LEFT JOIN article_reactions ar ON a.id = ar.article_id
       WHERE a.status = 'published' AND a.category IS NOT NULL AND a.category != ''
       GROUP BY a.category
       ORDER BY total_reactions DESC`
    );

    // Get engagement rate (articles with at least one reaction)
    const articlesWithReactions = await db.query(
      `SELECT COUNT(DISTINCT article_id) as count FROM article_reactions`
    );

    const engagementRate = totalArticles.rows[0].count > 0
      ? ((articlesWithReactions.rows[0].count / totalArticles.rows[0].count) * 100).toFixed(2)
      : 0;

    res.json({
      overview: {
        totalArticles: totalArticles.rows[0].count,
        totalReactions: totalReactions.rows[0].count,
        totalLikes: breakdown.likes,
        totalDislikes: breakdown.dislikes,
        articlesWithReactions: articlesWithReactions.rows[0].count,
        engagementRate: parseFloat(engagementRate)
      },
      mostLiked: mostLiked.rows,
      mostDisliked: mostDisliked.rows,
      mostEngaging: mostEngaging.rows,
      categoryStats: categoryStats.rows
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get detailed article statistics (admin only)
router.get('/articles/:articleId', authenticateToken, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const { articleId } = req.params;

    // Get article details
    const article = await db.query(
      `SELECT * FROM articles WHERE id = ?`,
      [articleId]
    );

    if (article.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Get reaction counts
    const reactions = await db.query(
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

    reactions.rows.forEach(row => {
      if (row.reaction === 'like') {
        reactionCounts.likes = row.count;
      } else if (row.reaction === 'dislike') {
        reactionCounts.dislikes = row.count;
      }
    });

    // Get users who reacted
    const reactors = await db.query(
      `SELECT
        u.username,
        u.role,
        ar.reaction,
        ar.created_at
       FROM article_reactions ar
       JOIN users u ON ar.user_id = u.id
       WHERE ar.article_id = ?
       ORDER BY ar.created_at DESC`,
      [articleId]
    );

    res.json({
      article: article.rows[0],
      reactions: reactionCounts,
      totalReactions: reactionCounts.likes + reactionCounts.dislikes,
      reactors: reactors.rows
    });
  } catch (error) {
    console.error('Error fetching article statistics:', error);
    res.status(500).json({ error: 'Failed to fetch article statistics' });
  }
});

export default router;
