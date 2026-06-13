import { useState, useEffect } from 'react';
import './CommentsPanel.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function CommentsPanel({ articleId, userRole, onCommentsChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comments/article/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setComments(data);
      setLoading(false);

      // Notify parent about unresolved count
      if (onCommentsChange) {
        const unresolvedCount = data.filter(c => !c.is_resolved).length;
        onCommentsChange(unresolvedCount);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comments/article/${articleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment_text: newComment })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      } else {
        const error = await response.json();
        alert(error.error || 'Eroare la adăugarea comentariului');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Eroare la adăugarea comentariului');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleResolve = async (commentId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comments/${commentId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_resolved: !currentStatus })
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error toggling comment resolution:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Sigur vrei să ștergi acest comentariu?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEditor = userRole === 'editor' || userRole === 'admin';
  const unresolvedCount = comments.filter(c => !c.is_resolved).length;

  return (
    <div className="comments-panel">
      <div className="comments-header">
        <h3>
          💬 Comentarii ({comments.length})
          {unresolvedCount > 0 && (
            <span className="unresolved-badge">{unresolvedCount} nerezolvate</span>
          )}
        </h3>
      </div>

      {isEditor && (
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adaugă un comentariu sau sugestie pentru jurnalist..."
            rows="3"
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !newComment.trim()}>
            {submitting ? 'Se trimite...' : 'Adaugă comentariu'}
          </button>
        </form>
      )}

      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">Se încarcă comentariile...</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            {isEditor ? 'Nu există comentarii. Adaugă primul comentariu!' : 'Nu există comentarii pentru acest articol.'}
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment-item ${comment.is_resolved ? 'resolved' : 'unresolved'}`}
            >
              <div className="comment-header">
                <div className="comment-author">
                  <span className={`author-badge ${comment.commenter_role}`}>
                    {comment.commenter_name}
                  </span>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
                {comment.is_resolved && (
                  <span className="resolved-badge">✓ Rezolvat</span>
                )}
              </div>

              <div className="comment-text">{comment.comment_text}</div>

              {comment.is_resolved && comment.resolved_at && (
                <div className="resolved-info">
                  Rezolvat pe {formatDate(comment.resolved_at)}
                </div>
              )}

              {isEditor && (
                <div className="comment-actions">
                  <button
                    className={comment.is_resolved ? 'unresolve-btn' : 'resolve-btn'}
                    onClick={() => handleToggleResolve(comment.id, comment.is_resolved)}
                  >
                    {comment.is_resolved ? '↶ Marchează ca nerezolvat' : '✓ Marchează ca rezolvat'}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    🗑️ Șterge
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentsPanel;
