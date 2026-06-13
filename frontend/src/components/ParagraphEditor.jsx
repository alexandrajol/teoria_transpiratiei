import { useState, useEffect } from 'react';
import './ParagraphEditor.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function ParagraphEditor({ article, onClose, onSave }) {
  const [paragraphs, setParagraphs] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Split content into paragraphs
    if (article.content) {
      const paras = article.content.split('\n\n').filter(p => p.trim());
      setParagraphs(paras);
    }
  }, [article.content]);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newParagraphs = [...paragraphs];
    const draggedItem = newParagraphs[draggedIndex];

    // Remove from old position
    newParagraphs.splice(draggedIndex, 1);
    // Insert at new position
    newParagraphs.splice(index, 0, draggedItem);

    setParagraphs(newParagraphs);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const newContent = paragraphs.join('\n\n');

      const response = await fetch(`${API_URL}/articles/${article.id}/content`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      });

      if (response.ok) {
        alert('Ordinea paragrafelor a fost salvată!');
        onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Eroare la salvarea modificărilor');
      }
    } catch (error) {
      console.error('Error saving paragraph order:', error);
      alert('Eroare la salvarea modificărilor');
    } finally {
      setSaving(false);
    }
  };

  const moveParagraphUp = (index) => {
    if (index === 0) return;
    const newParagraphs = [...paragraphs];
    [newParagraphs[index - 1], newParagraphs[index]] = [newParagraphs[index], newParagraphs[index - 1]];
    setParagraphs(newParagraphs);
  };

  const moveParagraphDown = (index) => {
    if (index === paragraphs.length - 1) return;
    const newParagraphs = [...paragraphs];
    [newParagraphs[index], newParagraphs[index + 1]] = [newParagraphs[index + 1], newParagraphs[index]];
    setParagraphs(newParagraphs);
  };

  return (
    <div className="paragraph-editor-overlay">
      <div className="paragraph-editor-container">
        <header className="paragraph-editor-header">
          <div>
            <h2>Reordonare Paragrafe</h2>
            <p className="subtitle">Trage și plasează paragrafele pentru a le reordona</p>
          </div>
          <div className="header-actions">
            <button className="cancel-button" onClick={onClose}>
              Anulează
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Se salvează...' : 'Salvează Ordinea'}
            </button>
          </div>
        </header>

        <div className="paragraph-editor-content">
          {paragraphs.length === 0 ? (
            <div className="no-paragraphs">
              Acest articol nu are conținut încă.
            </div>
          ) : (
            <div className="paragraphs-list">
              {paragraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className={`paragraph-item ${draggedIndex === index ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="paragraph-header">
                    <span className="paragraph-number">Paragraf {index + 1}</span>
                    <div className="paragraph-controls">
                      <button
                        className="move-button"
                        onClick={() => moveParagraphUp(index)}
                        disabled={index === 0}
                        title="Mută în sus"
                      >
                        ↑
                      </button>
                      <button
                        className="move-button"
                        onClick={() => moveParagraphDown(index)}
                        disabled={index === paragraphs.length - 1}
                        title="Mută în jos"
                      >
                        ↓
                      </button>
                      <span className="drag-handle" title="Trage pentru a muta">
                        ⋮⋮
                      </span>
                    </div>
                  </div>
                  <div className="paragraph-content">
                    {paragraph}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParagraphEditor;
