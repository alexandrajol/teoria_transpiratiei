import { useState, useEffect } from 'react';
import './ArticleForm.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function ArticleForm({ article, onClose }) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    main_journalist_id: article?.main_journalist_id || '',
    secondary_journalist_id: article?.secondary_journalist_id || ''
  });
  const [journalists, setJournalists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJournalists();
  }, []);

  const fetchJournalists = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching journalists from:', `${API_URL}/articles/journalists`);

      const response = await fetch(`${API_URL}/articles/journalists`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch journalists: ${response.status}`);
      }

      const data = await response.json();
      console.log('Journalists data:', data);
      setJournalists(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching journalists:', error);
      alert('Nu s-au putut încărca jurnaliștii. Verifică consola pentru detalii.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate only when editing existing article
    if (article && !formData.title.trim()) {
      alert('Titlul este obligatoriu');
      return;
    }

    if (article && !formData.main_journalist_id) {
      alert('Jurnalistul principal este obligatoriu');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = article
        ? `${API_URL}/articles/${article.id}`
        : `${API_URL}/articles`;

      const method = article ? 'PUT' : 'POST';

      // For new articles (POST), send empty object
      // For editing (PUT), send title and journalist IDs
      const payload = article ? {
        title: formData.title,
        main_journalist_id: formData.main_journalist_id || null,
        secondary_journalist_id: formData.secondary_journalist_id || null
      } : {};

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
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

  const availableSecondaryJournalists = journalists.filter(
    j => j.id !== parseInt(formData.main_journalist_id)
  );

  return (
    <div className="article-form-overlay">
      <div className="article-form-container">
        <div className="article-form-header">
          <h2>{article ? 'Editează Articol' : 'Articol Nou'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="form-loading">Se încarcă...</div>
        ) : (
          <form onSubmit={handleSubmit} className="article-form">
            <div className="form-group">
              <label htmlFor="title">Titlu Articol *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Introdu titlul articolului"
                disabled={!article}
              />
              {!article && (
                <p className="form-help-text">
                  Articolul va fi creat mai întâi. După aceea vei putea adăuga titlul și jurnaliștii.
                </p>
              )}
            </div>

            {article && (
              <>
                <div className="form-group">
                  <label htmlFor="main_journalist_id">Jurnalist Principal *</label>
                  <select
                    id="main_journalist_id"
                    name="main_journalist_id"
                    value={formData.main_journalist_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Selectează jurnalist principal --</option>
                    {journalists.map(journalist => (
                      <option key={journalist.id} value={journalist.id}>
                        {journalist.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="secondary_journalist_id">Jurnalist Secundar (Opțional)</label>
                  <select
                    id="secondary_journalist_id"
                    name="secondary_journalist_id"
                    value={formData.secondary_journalist_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Fără jurnalist secundar --</option>
                    {availableSecondaryJournalists.map(journalist => (
                      <option key={journalist.id} value={journalist.id}>
                        {journalist.username}
                      </option>
                    ))}
                  </select>
                  <p className="form-help-text">
                    Jurnalistul secundar nu poate fi același cu cel principal
                  </p>
                </div>

                <div className="article-note">
                  <strong>Notă:</strong> Jurnaliștii asignați vor putea edita conținutul, imaginile și alte detalii ale articolului.
                </div>
              </>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={saving}
              >
                Anulează
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving ? 'Se salvează...' : article ? 'Salvează Modificările' : 'Creează Articol'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ArticleForm;
