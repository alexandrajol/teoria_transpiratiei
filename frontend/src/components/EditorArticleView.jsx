import { useState } from 'react';
import './EditorArticleView.css';
import CommentsPanel from './CommentsPanel';
import ParagraphEditor from './ParagraphEditor';

function EditorArticleView({ article, onClose, onPublish, onUnpublish, onEdit, onDelete }) {
  const [unresolvedCommentsCount, setUnresolvedCommentsCount] = useState(0);
  const [showParagraphEditor, setShowParagraphEditor] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(article);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePublishClick = () => {
    if (unresolvedCommentsCount > 0) {
      alert(`Nu poți publica articolul! Mai sunt ${unresolvedCommentsCount} comentarii nerezolvate.`);
      return;
    }
    onPublish(currentArticle.id);
  };

  const handleParagraphSave = async () => {
    // Refresh article data after paragraph reordering
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/articles/editor/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const articles = await response.json();
    const updated = articles.find(a => a.id === currentArticle.id);
    if (updated) {
      setCurrentArticle(updated);
    }
  };

  return (
    <div className="editor-article-view">
      <header className="view-header">
        <button className="back-button" onClick={onClose}>
          ← Înapoi la listă
        </button>
        <div className="view-actions">
          {article.status === 'pending' ? (
            <button
              className="publish-button"
              onClick={handlePublishClick}
              disabled={unresolvedCommentsCount > 0}
              title={unresolvedCommentsCount > 0 ? 'Trebuie să rezolvi toate comentariile înainte de a publica' : 'Publică articolul'}
            >
              Publică
              {unresolvedCommentsCount > 0 && ` (${unresolvedCommentsCount} comentarii nerezolvate)`}
            </button>
          ) : (
            <button
              className="unpublish-button"
              onClick={() => onUnpublish(article.id)}
            >
              Retrage
            </button>
          )}
          <button className="edit-button" onClick={() => onEdit(currentArticle)}>
            Editează Titlu
          </button>
          {currentArticle.content && currentArticle.content.trim() && (
            <button
              className="reorder-button"
              onClick={() => setShowParagraphEditor(true)}
            >
              Reordonează Paragrafe
            </button>
          )}
          <button className="delete-button" onClick={() => onDelete(currentArticle.id)}>
            Șterge
          </button>
        </div>
      </header>

      {showParagraphEditor && (
        <ParagraphEditor
          article={currentArticle}
          onClose={() => setShowParagraphEditor(false)}
          onSave={handleParagraphSave}
        />
      )}

      <div className="view-content">
        <div className="view-main">
          <div className="article-header">
            <h1>{currentArticle.title || '(Fără titlu)'}</h1>
            <span className={`status-badge ${currentArticle.status}`}>
              {currentArticle.status === 'published' ? '✓ Publicat' : '⏳ În așteptare'}
            </span>
          </div>

          {currentArticle.image && (
            <img src={currentArticle.image} alt={currentArticle.title} className="article-image" />
          )}

          <div className="article-meta-grid">
            <div className="meta-item">
              <strong>Autor:</strong> {currentArticle.author || '(Necompletat)'}
            </div>
            <div className="meta-item">
              <strong>Categorie:</strong> {currentArticle.category || '(Necompletată)'}
            </div>
            <div className="meta-item">
              <strong>Jurnalist Principal:</strong> {currentArticle.main_journalist_username || 'Neasignat'}
            </div>
            {currentArticle.secondary_journalist_username && (
              <div className="meta-item">
                <strong>Jurnalist Secundar:</strong> {currentArticle.secondary_journalist_username}
              </div>
            )}
            <div className="meta-item">
              <strong>Data creării:</strong> {formatDate(currentArticle.date)}
            </div>
          </div>

          <div className="article-content">
            <h3>Conținut articol</h3>
            {currentArticle.content ? (
              currentArticle.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p className="empty-content">Articolul nu are conținut încă.</p>
            )}
          </div>
        </div>

        <aside className="view-sidebar">
          {currentArticle.status === 'pending' ? (
            <CommentsPanel
              articleId={currentArticle.id}
              userRole="editor"
              onCommentsChange={setUnresolvedCommentsCount}
            />
          ) : (
            <div className="published-notice">
              <h3>✓ Articol Publicat</h3>
              <p>Acest articol este deja publicat. Comentariile sunt disponibile doar pentru articolele în așteptare.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default EditorArticleView;
