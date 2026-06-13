import { useState, useEffect } from 'react';
import './JournalistDashboard.css';
import ArticleEditor from './ArticleEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function JournalistDashboard({ user, onLogout }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/journalist/my-articles`, {
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

  const handleEdit = (article) => {
    setEditingArticle(article);
  };

  const handleCloseEditor = async () => {
    setEditingArticle(null);
    await fetchArticles();

    // Refresh the selected article with updated data
    if (selectedArticle) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/journalist/my-articles/${selectedArticle.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const updatedArticle = await response.json();
        setSelectedArticle(updatedArticle);
      } catch (error) {
        console.error('Error refreshing article:', error);
      }
    }
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

  const getRoleColor = () => '#3399ff';

  if (editingArticle) {
    return (
      <ArticleEditor
        article={editingArticle}
        onClose={handleCloseEditor}
        user={user}
      />
    );
  }

  return (
    <div className="journalist-dashboard">
      <header className="journalist-header">
        <div className="header-left">
          <h1>Panou Jurnalist</h1>
          <p className="subtitle">Articolele tale asignate</p>
        </div>
        <div className="header-right">
          <span className="username">{user.username}</span>
          <span
            className="role-badge"
            style={{ backgroundColor: getRoleColor() }}
          >
            JOURNALIST
          </span>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading">Se încarcă...</div>
      ) : articles.length === 0 ? (
        <div className="no-articles">
          <h2>Nu ai articole asignate</h2>
          <p>Editorul trebuie să îți asigneze articole pentru a putea lucra la ele.</p>
        </div>
      ) : (
        <div className="journalist-layout">
          <aside className="articles-sidebar">
            <h3>Articolele tale ({articles.length})</h3>
            <ul className="article-list">
              {articles.map((article) => (
                <li
                  key={article.id}
                  className={`article-item ${selectedArticle?.id === article.id ? 'active' : ''} ${article.status}`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="article-item-header">
                    <h4>{article.title || '(Fără titlu)'}</h4>
                    <span className={`status-dot ${article.status}`}></span>
                  </div>
                  <div className="article-item-meta">
                    {article.main_journalist_id === user.id ? (
                      <span className="badge-main">Principal</span>
                    ) : (
                      <span className="badge-secondary">Secundar</span>
                    )}
                  </div>
                  <p className="article-item-date">{formatDate(article.date)}</p>
                </li>
              ))}
            </ul>
          </aside>

          <main className="article-preview">
            {selectedArticle ? (
              <>
                <div className="preview-header">
                  <div>
                    <h2>{selectedArticle.title || '(Fără titlu)'}</h2>
                    <div className="preview-meta">
                      <span className={`status-badge ${selectedArticle.status}`}>
                        {selectedArticle.status === 'published' ? 'Publicat' : 'În așteptare'}
                      </span>
                      {selectedArticle.category && (
                        <span className="category-badge">{selectedArticle.category}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="edit-article-button"
                    onClick={() => handleEdit(selectedArticle)}
                  >
                    Editează Conținut
                  </button>
                </div>

                {selectedArticle.image && (
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="preview-image"
                  />
                )}

                <div className="preview-details">
                  <div className="detail-row">
                    <strong>Autor:</strong> {selectedArticle.author || '(Necompletat)'}
                  </div>
                  <div className="detail-row">
                    <strong>Jurnalist Principal:</strong> {selectedArticle.main_journalist_username || 'Neasignat'}
                  </div>
                  {selectedArticle.secondary_journalist_username && (
                    <div className="detail-row">
                      <strong>Jurnalist Secundar:</strong> {selectedArticle.secondary_journalist_username}
                    </div>
                  )}
                  <div className="detail-row">
                    <strong>Data creării:</strong> {formatDate(selectedArticle.date)}
                  </div>
                </div>

                <div className="preview-content">
                  {selectedArticle.content ? (
                    selectedArticle.content.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="empty-content">Articolul nu are conținut. Apasă "Editează Conținut" pentru a adăuga text.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="no-selection">
                <h3>Selectează un articol</h3>
                <p>Alege un articol din listă pentru a-l vizualiza sau edita.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default JournalistDashboard;
