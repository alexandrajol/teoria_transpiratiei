import { useState, useEffect } from 'react';
import './EditorDashboard.css';
import ArticleForm from './ArticleForm';
import EditorArticleView from './EditorArticleView';
import StatisticsDashboard from './StatisticsDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function EditorDashboard({ user, onLogout }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, published
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [viewingArticle, setViewingArticle] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/editor/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setArticles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  };

  const handlePublish = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'published' })
      });

      if (response.ok) {
        fetchArticles();
      } else {
        const error = await response.json();
        if (error.unresolvedCount) {
          alert(`Nu poți publica articolul! Mai sunt ${error.unresolvedCount} comentarii nerezolvate.`);
        } else {
          alert(error.error || 'Eroare la publicarea articolului');
        }
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Eroare la publicarea articolului');
    }
  };

  const handleUnpublish = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'pending' })
      });

      if (response.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Error unpublishing article:', error);
    }
  };

  const handleDelete = async (articleId) => {
    if (!confirm('Ești sigur că vrei să ștergi acest articol?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingArticle(null);
    fetchArticles();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#ff4444',
      editor: '#ffbb33'
    };
    return colors[role] || '#999';
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true;
    return article.status === filter;
  });

  const pendingCount = articles.filter(a => a.status === 'pending').length;
  const publishedCount = articles.filter(a => a.status === 'published').length;

  if (showForm) {
    return (
      <ArticleForm
        article={editingArticle}
        onClose={handleFormClose}
        user={user}
      />
    );
  }

  if (showStatistics) {
    return <StatisticsDashboard onClose={() => setShowStatistics(false)} />;
  }

  if (viewingArticle) {
    return (
      <EditorArticleView
        article={viewingArticle}
        onClose={() => { setViewingArticle(null); fetchArticles(); }}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="editor-dashboard">
      <header className="editor-header">
        <div className="header-left">
          <h1>Panou Editor</h1>
        </div>
        <div className="header-right">
          <span className="username">{user.username}</span>
          <span
            className="role-badge"
            style={{ backgroundColor: getRoleColor(user.role) }}
          >
            {user.role.toUpperCase()}
          </span>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="editor-controls">
        <div className="controls-left">
          <button
            className="new-article-button"
            onClick={() => setShowForm(true)}
          >
            + Articol Nou
          </button>
          {user.role === 'admin' && (
            <button
              className="statistics-button"
              onClick={() => setShowStatistics(true)}
            >
              Statistici
            </button>
          )}
        </div>

        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Toate ({articles.length})
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            În așteptare ({pendingCount})
          </button>
          <button
            className={filter === 'published' ? 'active' : ''}
            onClick={() => setFilter('published')}
          >
            Publicate ({publishedCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Se încarcă...</div>
      ) : (
        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <div key={article.id} className={`article-card ${article.status}`}>
              <div className="article-card-image">
                <img src={article.image} alt={article.title} />
                <span className={`status-badge ${article.status}`}>
                  {article.status === 'published' ? 'Publicat' : 'În așteptare'}
                </span>
              </div>

              <div className="article-card-content">
                <h3>{article.title || '(Fără titlu)'}</h3>
                <div className="article-card-meta">
                  {article.main_journalist_username ? (
                    <>
                      <span className="journalist-badge main">
                        👤 {article.main_journalist_username}
                      </span>
                      {article.secondary_journalist_username && (
                        <span className="journalist-badge secondary">
                          + {article.secondary_journalist_username}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="no-journalist">Niciun jurnalist asignat</span>
                  )}
                </div>
                <div className="article-card-date">
                  {formatDate(article.date)}
                </div>
                {!article.title && !article.main_journalist_id && (
                  <p className="article-card-empty">
                    Articol gol - trebuie să adaugi titlu și jurnaliști
                  </p>
                )}
              </div>

              <div className="article-card-actions">
                <button
                  className="view-button"
                  onClick={() => setViewingArticle(article)}
                >
                  Vizualizează
                </button>
                <button
                  className="edit-button"
                  onClick={() => handleEdit(article)}
                >
                  Editează
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EditorDashboard;
