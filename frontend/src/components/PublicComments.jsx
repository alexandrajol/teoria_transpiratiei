import { useState, useEffect } from 'react';
import './PublicComments.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function PublicComments({ articleId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (user && articleId) {
      fetchComments();
    }
  }, [articleId, user]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/public-comments/article/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/public-comments/article/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment_text: newComment })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/public-comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.comment_text);
  };

  const handleUpdate = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/public-comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment_text: editText })
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(comments.map(c => c.id === commentId ? updatedComment : c));
        setEditingId(null);
        setEditText('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return commentDate.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#ff4444',
      editor: '#ffbb33',
      journalist: '#3399ff',
      viewer: '#44cc44'
    };
    return colors[role] || '#999';
  };

  if (!user) {
    return null; // Don't show comments section to guests
  }

  return (
    <div className="public-comments-section">
      <h3 className="comments-title">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          maxLength={1000}
          rows={3}
          className="comment-input"
        />
        <div className="comment-form-footer">
          <span className="char-count">
            {newComment.length}/1000
          </span>
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="submit-comment-btn"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="comment-item"
              style={{ borderLeftColor: comment.sentimentColor || '#CB769E' }}
            >
              <div className="comment-header">
                <div className="comment-user-info">
                  <span className="comment-username">{comment.username}</span>
                  <span
                    className="comment-role-badge"
                    style={{ backgroundColor: getRoleBadgeColor(comment.role) }}
                  >
                    {comment.role}
                  </span>
                  {comment.sentiment && (
                    <span
                      className="sentiment-badge"
                      style={{ backgroundColor: comment.sentimentColor }}
                      title={`Sentiment: ${comment.sentiment}`}
                    >
                      {comment.sentiment}
                    </span>
                  )}
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
                {(user.username === comment.username || user.role === 'admin') && (
                  <div className="comment-actions">
                    {user.username === comment.username && (
                      <button
                        onClick={() => handleEdit(comment)}
                        className="comment-action-btn edit-btn"
                        title="Edit"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="comment-action-btn delete-btn"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="comment-edit-form">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    className="comment-input"
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleUpdate(comment.id)}
                      className="save-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="comment-text">{comment.comment_text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PublicComments;
