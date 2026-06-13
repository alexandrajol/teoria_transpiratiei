import { useState } from 'react';
import './ArticleEditor.css';
import CommentsPanel from './CommentsPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function ArticleEditor({ article, onClose, user }) {
  const [formData, setFormData] = useState({
    content: article?.content || '',
    author: article?.author || '',
    category: article?.category || 'Știri',
    image: article?.image || ''
  });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [unresolvedCommentsCount, setUnresolvedCommentsCount] = useState(0);

  const categories = ['Știri', 'Sport', 'Cultură', 'Știință', 'Evenimente'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/journalist/my-articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Articol salvat cu succes!');
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Eroare la salvarea articolului');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Eroare la salvarea articolului');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="article-editor">
      <header className="editor-header">
        <div className="editor-title">
          <button className="back-button" onClick={onClose}>
            ← Înapoi
          </button>
          <div>
            <h2>Editare: {article.title || '(Fără titlu)'}</h2>
            <p className="editor-subtitle">
              Poți edita conținutul, autorul, categoria și imaginea
            </p>
          </div>
        </div>
        <div className="editor-actions">
          {article.status === 'pending' && unresolvedCommentsCount > 0 && (
            <span className="unresolved-indicator">
              💬 {unresolvedCommentsCount} comentarii nerezolvate
            </span>
          )}
          <button
            type="button"
            className="preview-toggle"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Editare' : 'Previzualizare'}
          </button>
          <button
            type="button"
            className="save-button"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </header>

      {previewMode ? (
        <div className="preview-container">
          <div className="preview-article">
            <h1 className="preview-article-title">{article.title}</h1>
            {formData.image && (
              <img src={formData.image} alt={article.title} className="preview-article-image" />
            )}
            <div className="preview-article-meta">
              <span className="author">{formData.author || 'Fără autor'}</span>
              <span className="separator">•</span>
              <span className="category">{formData.category}</span>
            </div>
            <div className="preview-article-content">
              {formData.content ? (
                formData.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p className="empty-preview">Conținutul este gol</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-layout">
            <div className="form-main">
              <div className="form-group">
                <label htmlFor="content">
                  Conținut Articol
                  <span className="label-hint">Folosește două Enter-uri pentru paragrafe noi</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="20"
                  placeholder="Scrie conținutul articolului aici...&#10;&#10;Poți crea paragrafe noi lăsând o linie goală între ele."
                  className="content-textarea"
                />
              </div>
            </div>

            <div className="form-sidebar">
              <div className="info-box">
                <h3>📝 Titlu</h3>
                <p className="readonly-field">{article.title || '(Fără titlu)'}</p>
                <small>Titlul poate fi modificat doar de editor</small>
              </div>

              <div className="form-group">
                <label htmlFor="author">Autor</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Numele autorului"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Categorie</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="image">URL Imagine</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
                <small>
                  Poți folosi{' '}
                  <a
                    href="https://picsum.photos/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Picsum Photos
                  </a>
                  {' '}pentru imagini placeholder
                </small>
              </div>

              <div className="info-box status-box">
                <h3>📊 Status</h3>
                <p className={`status-text ${article.status}`}>
                  {article.status === 'published' ? '✓ Publicat' : '⏳ În așteptare'}
                </p>
                <small>Doar editorul poate publica articole</small>
              </div>

              {article.status === 'pending' && (
                <div className="comments-section">
                  <CommentsPanel
                    articleId={article.id}
                    userRole="journalist"
                    onCommentsChange={setUnresolvedCommentsCount}
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default ArticleEditor;
